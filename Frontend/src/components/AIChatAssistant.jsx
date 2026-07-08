import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Loader2, Bot } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AIChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  
  const token = localStorage.getItem('token');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token || token}`
        }
      };
      
      const response = await axios.post('/api/ai/chat', { message: userMessage.text }, config);
      
      const aiMessage = { role: 'ai', text: response.data.data || "I'm sorry, I couldn't process that." };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = error.response?.data?.message || 'Sorry, I encountered an error. Please try again.';
      setMessages(prev => [...prev, { role: 'ai', text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Widget Button & Pill */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end group">
        {!isOpen && (
          <div className="absolute bottom-[72px] right-0 animate-float-delay origin-bottom-right transition-transform duration-300 group-hover:scale-105">
            <div className="bg-white text-slate-700 text-[13px] font-medium px-4 py-2 rounded-2xl shadow-lg border border-slate-100/80 whitespace-nowrap relative">
              ✨ Try me!
              <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white border-b border-r border-slate-100/80 transform rotate-45 rounded-sm"></div>
            </div>
          </div>
        )}
        <button
          onClick={toggleChat}
          className={`bg-gradient-to-br from-[#FF8A00] to-[#FF5E00] text-white p-4 rounded-full shadow-[0_8px_30px_rgb(255,94,0,0.3)] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_30px_rgb(255,94,0,0.5)] ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
          aria-label="Open AI Assistant"
        >
          <Sparkles size={24} className="opacity-90" />
        </button>
      </div>

      {/* Chat Window Panel */}
      <div 
        className={`bg-white border border-slate-100 rounded-2xl shadow-xl w-80 h-[450px] flex flex-col fixed bottom-6 right-6 z-50 transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="bg-orange-100 p-1.5 rounded-lg">
              <Bot size={18} className="text-orange-600" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">TeamReports AI Assistant</h3>
          </div>
          <button 
            onClick={toggleChat}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* Message Feed Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.length === 0 && (
            <div className="text-center text-slate-400 text-sm mt-8 space-y-2">
              <Bot size={32} className="mx-auto text-slate-300" />
              <p>Ask me about your team's reports, workload, or blockers!</p>
            </div>
          )}
          
          {messages.map((msg, index) => (
            <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div 
                className={`max-w-[85%] p-3 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'bg-orange-50 border border-orange-200/50 text-slate-800 rounded-br-sm' 
                    : 'bg-white border border-slate-200 shadow-sm text-slate-700 rounded-bl-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-start">
              <div className="bg-white border border-slate-200 shadow-sm rounded-2xl rounded-bl-sm p-3 flex items-center gap-2 text-slate-500">
                <Loader2 size={14} className="animate-spin text-orange-500" />
                <span className="text-[12px] font-medium">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 bg-white border-t border-slate-100 rounded-b-2xl">
          <form onSubmit={handleSubmit} className="relative flex items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (input.trim() && !isLoading) {
                    handleSubmit(e);
                  }
                }
              }}
              placeholder="Ask about your team..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none leading-relaxed custom-scrollbar"
              disabled={isLoading}
              rows={2}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="absolute right-2 bottom-2 p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AIChatAssistant;
