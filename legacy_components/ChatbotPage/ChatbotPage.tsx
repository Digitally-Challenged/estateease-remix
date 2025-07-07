import type { FormEvent, ChangeEvent } from 'react';
import React, { useState, useContext, useRef, useEffect } from 'react';

import { Sparkles, Trash2, UserCircle } from 'lucide-react'; // Added TrashIcon for clear chat

import { ChatContext } from '../../../../contexts/ChatContext';
import { ConfirmModal } from '../../../ui';
import Spinner from '../../../ui/feedback/Spinner';
import Button from '../../../ui/buttons/Button';
import Input from '../../../ui/inputs/Input';

import type { ChatContextType } from '../../../../contexts/ChatContext';
import type { Message } from '../../../../types'; // Import Message from global types.ts

const ChatbotPage: React.FC = () => {
  const chatCtx = useContext(ChatContext); // Explicitly type context
  const [userInput, setUserInput] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatCtx?.messages, chatCtx?.isLoading]); // Also scroll when loading state changes

  if (!chatCtx) {
    return (
      <p className="p-4 text-red-600 dark:text-red-400">
        Error: ChatContext not available. Ensure ChatProvider is set up.
      </p>
    );
  }

  const { messages, sendMessage, isLoading, error, clearChat } = chatCtx;

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (userInput.trim() && !isLoading) {
      await sendMessage(userInput);
      setUserInput('');
    }
  };

  const handleClearChat = () => {
    setShowClearConfirm(true);
  };

  const handleConfirmClear = () => {
    clearChat();
    setShowClearConfirm(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-h-[calc(100vh-8rem)] bg-white dark:bg-neutral-800 rounded-lg shadow-xl">
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">
          AI Assistant
        </h2>
        <Button
          onClick={handleClearChat}
          variant="ghost"
          size="sm"
          aria-label="Clear chat history"
          disabled={(messages.length === 0 && !error) || isLoading}
          leftIcon={<Trash2 className="w-4 h-4" />}
        >
          Clear Chat
        </Button>
      </div>

      <div className="flex-grow p-4 space-y-4 overflow-y-auto">
        {messages.length === 0 && !isLoading && !error && (
          <div className="text-center text-neutral-500 dark:text-neutral-400 pt-10">
            <Sparkles className="w-12 h-12 mx-auto mb-2 text-primary-DEFAULT" />
            <p>Ask me anything about your estate or how to use the app!</p>
          </div>
        )}
        {messages.map((msg: Message) => (
          <div
            key={msg.id}
            className={`flex items-end space-x-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'model' && (
              <Sparkles className="w-6 h-6 text-secondary-DEFAULT mb-1 flex-shrink-0" />
            )}
            <div
              className={`max-w-xl lg:max-w-2xl px-3.5 py-2 rounded-xl shadow ${
                msg.role === 'user'
                  ? 'bg-primary-DEFAULT text-white rounded-br-none'
                  : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
              <p
                className={`text-xs mt-1.5 ${msg.role === 'user' ? 'text-primary-light/80 text-right' : 'text-neutral-500 dark:text-neutral-400/80'}`}
              >
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            {msg.role === 'user' && (
              <UserCircle className="w-6 h-6 text-neutral-400 dark:text-neutral-500 mb-1 flex-shrink-0" />
            )}
          </div>
        ))}

        {/* AI "typing" indicator */}
        {isLoading && (messages.length === 0 || messages[messages.length - 1].role === 'user') && (
          <div className="flex items-end space-x-2 justify-start">
            <Sparkles className="w-6 h-6 text-secondary-DEFAULT mb-1 flex-shrink-0" />
            <div className="max-w-xs px-3.5 py-2 rounded-xl shadow bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 rounded-bl-none">
              <Spinner size="sm" color="text-secondary-DEFAULT" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && <p className="px-4 pb-2 text-sm text-red-600 dark:text-red-400">Error: {error}</p>}

      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-neutral-200 dark:border-neutral-700 flex items-center"
      >
        <Input
          id="chat-user-input"
          type="text"
          value={userInput}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setUserInput(e.target.value)}
          placeholder="Ask the AI assistant..."
          className="flex-grow !mb-0"
          wrapperClassName="!mb-0 flex-grow mr-2"
          disabled={isLoading}
          aria-label="User input for AI assistant"
        />
        <Button type="submit" isLoading={isLoading} disabled={isLoading || !userInput.trim()}>
          Send
        </Button>
      </form>

      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleConfirmClear}
        title="Clear Chat History?"
        message="Are you sure you want to clear the chat history? This action cannot be undone."
        variant="warning"
        confirmText="Clear History"
        cancelText="Cancel"
      />
    </div>
  );
};

export default ChatbotPage;
