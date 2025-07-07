import type { ReactNode } from 'react';
import React, { createContext, useState, useCallback, useRef } from 'react';

import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

import { getEnvironmentConfig, isEnvironmentConfigured, getSetupInstructions } from '../utils/env';

import type { Message } from '../types'; // Assuming Message type is defined in types.ts
import type { Chat } from '@google/genai';

// Get API key from environment
let API_KEY: string | undefined;
try {
  if (isEnvironmentConfigured()) {
    const config = getEnvironmentConfig();
    API_KEY = config.geminiApiKey;
  }
} catch (error) {
  console.warn('Gemini API not configured:', error);
}

export interface ChatContextType {
  messages: Message[];
  sendMessage: (userInput: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearChat: () => void;
  loadMessages: (messages: Message[]) => void; // Added for importing messages
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const aiRef = useRef<GoogleGenAI | null>(null);
  const chatRef = useRef<Chat | null>(null);

  // Initialize AI and Chat
  if (!aiRef.current && API_KEY) {
    aiRef.current = new GoogleGenAI({ apiKey: API_KEY });
  }

  const initializeChat = useCallback(() => {
    if (aiRef.current && !chatRef.current) {
      try {
        chatRef.current = aiRef.current.chats.create({
          model: 'gemini-2.5-flash-preview-04-17',
          config: {
            systemInstruction:
              'You are a friendly and knowledgeable AI assistant for EstateEase, specializing in estate planning, asset management, and document understanding. Provide clear, concise, and helpful information. Do not give financial or legal advice, but you can explain concepts and guide users on how to use the app. Your tone should be professional yet approachable.',
          },
        });
      } catch (e) {
        console.error('Failed to initialize chat session:', e);
        setError(e instanceof Error ? e.message : 'Failed to initialize chat session.');
        chatRef.current = null; // Ensure it's null if init fails
      }
    }
  }, []);

  const sendMessage = useCallback(
    async (userInput: string) => {
      if (!API_KEY) {
        setError('AI Assistant is unavailable: API Key is not configured.');
        console.error('API_KEY is missing for ChatContext.');
        setIsLoading(false);
        return;
      }

      if (!aiRef.current) {
        setError('AI client not initialized. Please check API key configuration.');
        setIsLoading(false);
        return;
      }

      initializeChat(); // Ensure chat is initialized

      if (!chatRef.current) {
        setError('Chat session could not be established. Please try again.');
        setIsLoading(false);
        return;
      }

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        text: userInput,
        timestamp: new Date().toISOString(),
      };
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const stream = await chatRef.current.sendMessageStream({ message: userInput });

        let modelResponseText = '';
        const modelMessageId = `model-${Date.now()}`;

        // Add a placeholder for the model's message to update in real-time
        setMessages(prevMessages => [
          ...prevMessages,
          { id: modelMessageId, role: 'model', text: '...', timestamp: new Date().toISOString() },
        ]);

        for await (const chunk of stream) {
          // chunk is GenerateContentResponse
          modelResponseText += chunk.text;
          setMessages(prevMessages =>
            prevMessages.map(msg =>
              msg.id === modelMessageId
                ? { ...msg, text: modelResponseText, timestamp: new Date().toISOString() }
                : msg,
            ),
          );
        }
        // Final update for the completed message, though the map above should handle it.
        // This ensures the timestamp is for the final chunk.
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === modelMessageId
              ? { ...msg, text: modelResponseText, timestamp: new Date().toISOString() }
              : msg,
          ),
        );
      } catch (e) {
        console.error('Error sending message to Gemini:', e);
        const errorMessage =
          e instanceof Error ? e.message : 'An unknown error occurred with the AI Assistant.';
        setError(errorMessage);
        // Optionally add an error message to the chat
        setMessages(prevMessages => [
          ...prevMessages,
          {
            id: `error-${Date.now()}`,
            role: 'model',
            text: `Sorry, I encountered an error: ${errorMessage}`,
            timestamp: new Date().toISOString(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [initializeChat],
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    // Potentially re-initialize chat session if desired, or keep existing one
    // chatRef.current = null;
    // initializeChat();
    console.log('Chat cleared.');
  }, []);

  const loadMessages = useCallback(
    (newMessages: Message[]) => {
      setMessages(newMessages);
      // Optionally, you might want to reset the backend chat history if your AI service supports it
      // For this client-side only version, just setting the local messages is enough.
      // If the chat history in `chatRef.current` should be cleared/re-initialized:
      // chatRef.current = null;
      // initializeChat(); // This would start a new session with the AI.
      // If the AI should be aware of the loaded history, you'd need to send it.
      // This is complex for streaming chats and typically means starting a new Chat instance
      // with the historical messages, which is not directly supported by `ai.chats.create`
      // in one go with history for streaming. For now, this just loads to UI.
      console.log('Chat messages loaded into UI.');
    },
    [setMessages],
  ); // Removed initializeChat from dependencies as it's not directly needed here

  return (
    <ChatContext.Provider
      value={{ messages, sendMessage, isLoading, error, clearChat, loadMessages }}
    >
      {children}
    </ChatContext.Provider>
  );
};
