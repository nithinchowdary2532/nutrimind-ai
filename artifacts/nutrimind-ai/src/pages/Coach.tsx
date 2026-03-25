import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useListAnthropicConversations, 
  useCreateAnthropicConversation,
  useGetAnthropicConversation,
  getGetAnthropicConversationQueryKey
} from "@workspace/api-client-react";

const PROMPTS = [
  "What should I eat next?",
  "Am I hitting protein goals?",
  "Give me an energy tip",
  "Suggest a meal plan"
];

export default function Coach() {
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [input, setInput] = useState("");
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [optimisticMessages, setOptimisticMessages] = useState<any[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // 1. Get or create conversation
  const { data: convos, isLoading: convosLoading } = useListAnthropicConversations();
  const createConvo = useCreateAnthropicConversation();

  useEffect(() => {
    if (!convosLoading && convos) {
      if (convos.length > 0) {
        setActiveConvId(convos[0].id);
      } else {
        createConvo.mutate(
          { data: { title: "Nutrition Coach" } },
          { onSuccess: (res) => setActiveConvId(res.id) }
        );
      }
    }
  }, [convos, convosLoading]);

  // 2. Fetch messages for active conversation
  const { data: conversationData } = useGetAnthropicConversation(activeConvId || 0, {
    query: { enabled: !!activeConvId }
  });

  // Sync db messages to local state
  useEffect(() => {
    if (conversationData?.messages) {
      setOptimisticMessages(conversationData.messages);
    }
  }, [conversationData?.messages]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [optimisticMessages, streamingContent]);

  // Handle SSE streaming manually since Orval doesn't support SSE hooks well
  const handleSend = async (contentOverride?: string) => {
    const textToSend = contentOverride || input;
    if (!textToSend.trim() || !activeConvId || isTyping) return;

    // Optimistic UI update
    const tempId = Date.now();
    setOptimisticMessages(prev => [...prev, { id: tempId, role: "user", content: textToSend, createdAt: new Date().toISOString() }]);
    setInput("");
    setIsTyping(true);
    setStreamingContent("");

    try {
      const res = await fetch(`/api/anthropic/conversations/${activeConvId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: textToSend })
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (!dataStr.trim()) continue;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.done) {
                setIsTyping(false);
                queryClient.invalidateQueries({ queryKey: getGetAnthropicConversationQueryKey(activeConvId) });
              } else if (parsed.content) {
                setStreamingContent(prev => prev + parsed.content);
              }
            } catch (e) {
              console.error("Failed to parse SSE chunk", e);
            }
          }
        }
      }
    } catch (e) {
      console.error("Stream error", e);
      setIsTyping(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-foreground">AI Coach</h1>
        <p className="text-muted-foreground mt-1">Ask questions based on your logged meals and data.</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border border-border shadow-sm">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-muted/20">
          
          {optimisticMessages.length === 0 && !isTyping && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Hi, I'm your Nutrition Coach</h3>
              <p className="text-muted-foreground mt-2 mb-8">I analyze your meals and wearable data to give you personalized advice.</p>
              <div className="flex flex-wrap justify-center gap-2">
                {PROMPTS.map(p => (
                  <button 
                    key={p} 
                    onClick={() => handleSend(p)}
                    className="px-4 py-2 bg-background border border-border rounded-full text-sm hover:border-primary hover:text-primary transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {optimisticMessages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              <div className={`px-4 py-3 rounded-2xl max-w-[80%] text-sm md:text-base ${
                msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                  : 'bg-card border border-border text-foreground rounded-tl-sm shadow-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="px-4 py-3 rounded-2xl max-w-[80%] bg-card border border-border text-foreground rounded-tl-sm shadow-sm text-sm md:text-base">
                {streamingContent ? (
                  <span>{streamingContent}<span className="inline-block w-1.5 h-4 ml-1 bg-primary animate-pulse align-middle"></span></span>
                ) : (
                  <div className="flex gap-1 items-center h-5">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                )}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-card border-t border-border">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
            className="flex gap-2 max-w-4xl mx-auto relative"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your nutrition..."
              className="flex-1 px-4 py-3 pr-12 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              disabled={isTyping || !activeConvId}
            />
            <Button 
              type="submit" 
              variant="default"
              size="icon"
              className="absolute right-1.5 top-1.5 rounded-lg w-9 h-9"
              disabled={!input.trim() || isTyping || !activeConvId}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </motion.div>
  );
}
