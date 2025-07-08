import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/forms/input";
import { 
  MessageSquare, 
  Send, 
  Sparkles,
  Info,
  BookOpen,
  Shield,
  TrendingUp
} from "lucide-react";

export default function Chatbot() {
  const suggestedQuestions = [
    {
      category: "Estate Planning Basics",
      icon: BookOpen,
      questions: [
        "What documents do I need for a complete estate plan?",
        "How often should I update my estate plan?",
        "What's the difference between a will and a trust?"
      ]
    },
    {
      category: "Tax Planning",
      icon: TrendingUp,
      questions: [
        "How can I minimize estate taxes?",
        "What is the current federal estate tax exemption?",
        "Should I consider gifting strategies?"
      ]
    },
    {
      category: "Asset Protection",
      icon: Shield,
      questions: [
        "How can I protect my assets from creditors?",
        "What types of trusts offer the best protection?",
        "Should I consider an LLC for my properties?"
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-indigo-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">AI Estate Planning Advisor</h1>
        <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-2">Get personalized guidance for your estate planning questions</p>
      </div>

      {/* Info Banner */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
        <CardContent className="flex items-start space-x-3 p-4">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium">How it works:</p>
            <p className="mt-1">Ask questions about estate planning, taxes, trusts, or any related topic. Our AI advisor will provide personalized guidance based on your estate structure.</p>
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="h-[400px] flex flex-col">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
            <CardTitle className="text-lg">Chat with AI Advisor</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400 dark:text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">Start a conversation</p>
            <p className="text-sm mt-1">Ask any estate planning question to get started</p>
          </div>
        </CardContent>
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex space-x-2">
            <Input 
              placeholder="Type your estate planning question..." 
              className="flex-1"
            />
            <Button>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Suggested Questions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Suggested Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suggestedQuestions.map((category) => {
            const Icon = category.icon;
            return (
              <Card key={category.category}>
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
                    <CardTitle className="text-sm">{category.category}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.questions.map((question, index) => (
                      <li key={index}>
                        <button className="text-sm text-left text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:text-blue-200 hover:underline">
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

      {/* Coming Soon Notice */}
      <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardContent className="text-center py-8">
          <Sparkles className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">AI Advisor Coming Soon!</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-2 max-w-md mx-auto">
            We&apos;re building an intelligent AI advisor to help answer your estate planning questions. 
            This feature will be available in the next update.
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 