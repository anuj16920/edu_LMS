import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Bot, Send, User, Loader2, Sparkles } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import apiClient from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: number;
  sender: "bot" | "user";
  message: string;
  timestamp?: string;
}

const StudentChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "bot",
      message: "Hello! I'm your AI learning assistant powered by Google Gemini. How can I help you today? 🎓",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch suggested questions
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await apiClient.get("/chatbot/suggestions");
        setSuggestions(response.data.suggestions.slice(0, 4));
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    };
    fetchSuggestions();
  }, []);

  // Send message to AI
  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputText.trim();
    
    if (!textToSend) {
      toast.error("Please enter a message");
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      sender: "user",
      message: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      // Send to backend AI chatbot
      const response = await apiClient.post("/chatbot/ask", {
        message: textToSend,
        conversationHistory: messages.slice(-6), // Send last 6 messages for context
      });

      // Add bot response
      const botMessage: Message = {
        id: messages.length + 2,
        sender: "bot",
        message: response.data.message,
        timestamp: response.data.timestamp,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      console.error("Chatbot error:", error);
      toast.error("Failed to get AI response. Please try again.");
      
      // Add error message
      const errorMessage: Message = {
        id: messages.length + 2,
        sender: "bot",
        message: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-6 h-full flex flex-col">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-cyan-glow to-accent bg-clip-text text-transparent">
            AI Chatbot
          </h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Powered by Google Gemini AI - Get instant help with your studies
          </p>
        </div>

        {/* Chat Container */}
        <Card className="flex-1 flex flex-col border-border/50 bg-card/50 overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-border/50 bg-gradient-to-r from-primary/10 to-cyan-glow/10">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-gradient-to-br from-primary to-cyan-glow">
                  <Bot className="w-6 h-6 text-white" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">AI Learning Assistant</h3>
                <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                  Online
                </Badge>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <Avatar className="w-10 h-10">
                  <AvatarFallback
                    className={
                      msg.sender === "bot"
                        ? "bg-gradient-to-br from-primary to-cyan-glow"
                        : "bg-gradient-to-br from-green-500 to-emerald-500"
                    }
                  >
                    {msg.sender === "bot" ? (
                      <Bot className="w-5 h-5 text-white" />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    msg.sender === "bot"
                      ? "bg-secondary/50 border border-border/50"
                      : "bg-gradient-to-r from-primary to-cyan-glow text-white"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {msg.message}
                  </p>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-cyan-glow">
                    <Bot className="w-5 h-5 text-white" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-secondary/50 border border-border/50 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border/50 bg-secondary/20">
            <div className="flex gap-2">
              <Input
                placeholder="Ask me anything about your studies..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1 bg-secondary/30 border-border/50"
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputText.trim()}
                className="bg-gradient-to-r from-primary to-cyan-glow hover:opacity-90"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Suggestions */}
        {messages.length <= 1 && suggestions.length > 0 && (
          <Card className="p-6 border-border/50 bg-card/50">
            <h3 className="font-semibold mb-4">💡 Suggested Questions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={isLoading}
                  className="text-left justify-start h-auto py-3 px-4 border-border/50 hover:bg-primary/10 hover:border-primary/50"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentChatbot;
