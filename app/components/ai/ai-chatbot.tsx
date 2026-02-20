import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/forms/input";
import { Badge } from "~/components/ui/badge";
import MessageSquare from "lucide-react/dist/esm/icons/message-square";
import Send from "lucide-react/dist/esm/icons/send";
import Bot from "lucide-react/dist/esm/icons/bot";
import User from "lucide-react/dist/esm/icons/user";
import Brain from "lucide-react/dist/esm/icons/brain";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import Shield from "lucide-react/dist/esm/icons/shield";
import BookOpen from "lucide-react/dist/esm/icons/book-open";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import Copy from "lucide-react/dist/esm/icons/copy";
import ThumbsUp from "lucide-react/dist/esm/icons/thumbs-up";
import ThumbsDown from "lucide-react/dist/esm/icons/thumbs-down";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import type { QueryAnalysis, ConversationContext } from "~/lib/ai-natural-language";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  analysis?: QueryAnalysis;
  confidence?: number;
  category?: string;
  suggestions?: string[];
}

interface AIChatbotProps {
  initialContext?: Partial<ConversationContext>;
  onQueryAnalyze?: (query: string) => Promise<QueryAnalysis>;
  onResponseGenerate?: (query: string, analysis: QueryAnalysis) => Promise<string>;
  onFeedback?: (messageId: string, feedback: "positive" | "negative") => void;
}

export function AIChatbot({
  initialContext,
  onQueryAnalyze,
  onResponseGenerate,
  onFeedback,
}: AIChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm your AI Estate Planning Advisor. I can help answer questions about estate planning, trusts, taxes, and more. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setContext] = useState<Partial<ConversationContext>>(initialContext || {});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Analyze the query
      const analysis = (await onQueryAnalyze?.(inputValue)) || {
        intent: "question" as const,
        category: "estate" as const,
        confidence: 70,
        entities: [],
        suggestedResponses: [],
      };

      // Generate response
      const responseContent =
        (await onResponseGenerate?.(inputValue, analysis)) ||
        generateDefaultResponse(inputValue, analysis);

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
        analysis,
        confidence: analysis.confidence,
        category: analysis.category,
        suggestions: analysis.suggestedResponses,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update context
      setContext((prev) => ({
        ...prev,
        previousQueries: [...(prev.previousQueries || []), inputValue].slice(-10),
      }));
    } catch (error) {
      console.error("Error processing message:", error);

      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content:
          "I apologize, but I encountered an error processing your question. Please try rephrasing your question or contact support if the issue persists.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateDefaultResponse = (query: string, analysis: QueryAnalysis): string => {
    const { category, intent, confidence } = analysis;

    if (confidence < 50) {
      return "I want to make sure I understand your question correctly. Could you provide a bit more detail about what you'd like to know about estate planning?";
    }

    const responses: Record<string, Record<string, string[]>> = {
      tax: {
        question: [
          "Tax planning is crucial for estate optimization. The current federal estate tax exemption for 2024 is $13.61 million per person. Key strategies include annual gifting, charitable giving, and trust structures.",
          "Estate taxes can significantly impact your legacy. Consider strategies like generation-skipping trusts, family limited partnerships, and charitable remainder trusts to minimize tax exposure.",
        ],
      },
      estate: {
        question: [
          "A comprehensive estate plan typically includes a will, power of attorney, healthcare directive, and often trusts. The key is ensuring your wishes are clearly documented and legally enforceable.",
          "Estate planning involves coordinating legal documents, tax strategies, and asset protection measures. Regular reviews are essential as laws and circumstances change.",
        ],
      },
      trust: {
        question: [
          "Trusts offer significant benefits including asset protection, tax advantages, and privacy. Revocable trusts provide flexibility while irrevocable trusts offer stronger protection and tax benefits.",
          "The right trust structure depends on your goals. Living trusts avoid probate, charitable trusts provide tax benefits, and asset protection trusts shield wealth from creditors.",
        ],
      },
    };

    const categoryResponses = responses[category]?.[intent] || [
      "That's an excellent question about estate planning. Let me provide you with some helpful guidance based on current best practices and legal requirements.",
      "I'd be happy to help you understand this aspect of estate planning. Here's what you should know based on your situation.",
    ];

    return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleFeedback = (messageId: string, feedback: "positive" | "negative") => {
    onFeedback?.(messageId, feedback);
  };

  const clearConversation = () => {
    setMessages([
      {
        id: "welcome-new",
        role: "assistant",
        content: "Hi! I'm your AI Estate Planning Advisor. How can I help you today?",
        timestamp: new Date(),
      },
    ]);
    setContext({});
  };

  const suggestedQuestions = [
    {
      category: "Estate Planning Basics",
      icon: BookOpen,
      questions: [
        "What documents do I need for a complete estate plan?",
        "How often should I update my estate plan?",
        "What's the difference between a will and a trust?",
      ],
    },
    {
      category: "Tax Planning",
      icon: TrendingUp,
      questions: [
        "How can I minimize estate taxes?",
        "What is the current federal estate tax exemption?",
        "Should I consider gifting strategies?",
      ],
    },
    {
      category: "Asset Protection",
      icon: Shield,
      questions: [
        "How can I protect my assets from creditors?",
        "What types of trusts offer the best protection?",
        "Should I consider an LLC for my properties?",
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mb-4 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
            <Brain className="h-6 w-6 text-indigo-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          AI Estate Planning Advisor
        </h1>
        <p className="mt-2 text-gray-600">
          Get personalized guidance powered by advanced AI
        </p>
      </div>

      {/* Chat Interface */}
      <Card className="flex h-[600px] flex-col">
        <CardHeader className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-gray-600" />
              <CardTitle className="text-lg">Chat with AI Advisor</CardTitle>
            </div>
            <Button onClick={clearConversation} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Clear Chat
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0">
          {/* Messages */}
          <div className="h-full space-y-4 overflow-y-auto p-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[80%] ${message.role === "user" ? "order-2" : "order-1"}`}>
                  <div
                    className={`flex items-start space-x-3 ${message.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                  >
                    <div
                      className={`rounded-full p-2 ${
                        message.role === "user"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-indigo-100 text-indigo-600"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>

                    <div
                      className={`rounded-lg p-4 ${
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>

                      {/* Assistant message metadata */}
                      {message.role === "assistant" && message.analysis && (
                        <div className="mt-3 border-t border-gray-200 pt-3">
                          <div className="flex items-center space-x-2">
                            {message.confidence && (
                              <Badge variant="outline" className="text-xs">
                                {message.confidence}% confidence
                              </Badge>
                            )}
                            {message.category && (
                              <Badge variant="secondary" className="text-xs capitalize">
                                {message.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </span>

                        {message.role === "assistant" && (
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCopyMessage(message.content)}
                              className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleFeedback(message.id, "positive")}
                              className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleFeedback(message.id, "negative")}
                              className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3">
                  <div className="rounded-full bg-indigo-100 p-2 text-indigo-600">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-lg bg-gray-100 p-4">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-gray-600">
                        AI is thinking...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </CardContent>

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask any estate planning question..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Suggested Questions */}
      {messages.length <= 1 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Suggested Questions
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {suggestedQuestions.map((category) => {
              const Icon = category.icon;
              return (
                <Card key={category.category}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4 text-gray-600" />
                      <CardTitle className="text-sm">{category.category}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.questions.map((question, index) => (
                        <li key={index}>
                          <button
                            className="text-left text-sm text-blue-600 hover:text-blue-800 hover:underline"
                            onClick={() => setInputValue(question)}
                          >
                            {question}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default AIChatbot;
