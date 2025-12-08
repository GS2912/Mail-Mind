import { useState, useRef, useEffect } from 'react';
import { agentApi, ChatResponse } from '../services/api';
import MarkdownRenderer from '../components/MarkdownRenderer';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolExecuted?: {
    name: string;
    result: any;
  };
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI email assistant. I can help you manage your inbox, draft emails, check for urgent messages, and more. How can I help you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatHistory = useRef<Array<{ role: string; content: string }>>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const predictToolUsage = (message: string): string | null => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('inbox') || lowerMessage.includes('email') || lowerMessage.includes('urgent') || lowerMessage.includes('unread') || lowerMessage.includes('pending') || lowerMessage.includes('summarize')) {
      return 'getInbox';
    }
    if (lowerMessage.includes('send') && (lowerMessage.includes('email') || lowerMessage.includes('message'))) {
      return 'sendEmail';
    }
    if (lowerMessage.includes('contact') || lowerMessage.includes('who')) {
      return 'getContacts';
    }
    return null;
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setLoading(true);

    // Predict and show tool notification immediately if likely to use a tool
    const predictedTool = predictToolUsage(userInput);
    if (predictedTool) {
      const toolMessage: Message = {
        role: 'assistant',
        content: getToolMessage(predictedTool),
      };
      setMessages((prev) => [...prev, toolMessage]);
    }

    try {
      const response: ChatResponse = await agentApi.chat({
        message: userInput,
        history: chatHistory.current,
      });

      // Remove predicted tool message if it was wrong, or keep it if correct
      if (predictedTool && response.toolExecuted) {
        // Tool was actually used, keep the notification
        if (predictedTool !== response.toolExecuted.name) {
          // Different tool was used, update the message
          setMessages((prev) => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            if (updated[lastIndex]?.content === getToolMessage(predictedTool)) {
              updated[lastIndex] = {
                role: 'assistant',
                content: getToolMessage(response.toolExecuted!.name),
              };
            }
            return updated;
          });
        }
      } else if (predictedTool && !response.toolExecuted) {
        // Tool was predicted but not used, remove the notification
        setMessages((prev) => prev.filter((msg, idx) => 
          !(idx === prev.length - 1 && msg.content === getToolMessage(predictedTool))
        ));
      } else if (!predictedTool && response.toolExecuted) {
        // Tool was used but not predicted, add notification
        const toolMessage: Message = {
          role: 'assistant',
          content: getToolMessage(response.toolExecuted.name),
        };
        setMessages((prev) => [...prev, toolMessage]);
      }

      // Then show AI response
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.reply,
        toolExecuted: response.toolExecuted,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      chatHistory.current = response.history;
    } catch (error: any) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message || 'Unknown error'}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const getToolMessage = (toolName: string): string => {
    const messages: Record<string, string> = {
      getInbox: '📬 Checking inbox...',
      sendEmail: '📧 Sending email...',
      getContacts: '👥 Fetching contacts...',
    };
    return messages[toolName] || '🔧 Executing tool...';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const exampleQueries = [
    'What is urgent today?',
    'Draft a short email to professor about project submission',
    'Who hasn\'t replied yet?',
    'Summarize last 10 emails',
    'Show me unread emails',
  ];

  return (
    <div className="container mx-auto px-6 py-8 max-w-5xl">
      <div className="mb-8">
        <h2 className="text-4xl font-semibold text-mailmind-text-light mb-2">Chat Agent</h2>
        <p className="text-mailmind-text-muted">
          Ask me anything about your inbox, draft emails, or get summaries.
        </p>
      </div>

      {/* Example Queries */}
      <div className="mb-6">
        <p className="text-sm text-mailmind-text-muted mb-3 font-medium">Try asking:</p>
        <div className="flex flex-wrap gap-2">
          {exampleQueries.map((query, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInput(query);
              }}
              className="text-xs bg-mailmind-card border border-mailmind-teal/30 text-mailmind-text-light px-4 py-2 rounded-xl hover:border-mailmind-teal hover:bg-mailmind-teal/10 transition-smooth font-medium"
            >
              {query}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="bg-mailmind-card rounded-xl shadow-soft border border-mailmind-teal/20 h-[650px] flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[75%] rounded-xl px-5 py-3 transition-smooth ${
                  message.role === 'user'
                    ? 'bg-gradient-chat-user text-white shadow-glow-orange'
                    : 'bg-mailmind-bg border border-mailmind-teal/30 text-mailmind-text-light'
                }`}
              >
                {message.role === 'user' ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                ) : (
                  <MarkdownRenderer 
                    content={message.content} 
                    variant="chat-assistant"
                  />
                )}
                {message.toolExecuted && (
                  <div className="mt-2 text-xs opacity-75 flex items-center gap-1">
                    <span>🔧</span>
                    <span>Tool: {message.toolExecuted.name}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-mailmind-bg border border-mailmind-teal/30 rounded-xl px-5 py-3">
                <div className="flex gap-2 items-center">
                  <span className="w-2 h-2 bg-mailmind-teal rounded-full animate-bounce"></span>
                  <span
                    className="w-2 h-2 bg-mailmind-orange rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></span>
                  <span
                    className="w-2 h-2 bg-mailmind-pink rounded-full animate-bounce"
                    style={{ animationDelay: '0.4s' }}
                  ></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-mailmind-teal/20 p-5 bg-mailmind-bg/50">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 bg-mailmind-bg border border-mailmind-teal/30 rounded-xl px-5 py-3 text-mailmind-text-light placeholder-mailmind-text-muted focus:outline-none focus:border-mailmind-teal focus:ring-2 focus:ring-mailmind-teal/20 transition-smooth"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-gradient-primary text-white px-8 py-3 rounded-xl font-medium transition-smooth hover:shadow-glow-orange disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
