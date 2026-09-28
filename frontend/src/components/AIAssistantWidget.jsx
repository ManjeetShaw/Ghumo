import React, { useState } from 'react';
import { aiApi } from '../api.js';

export default function AIAssistantWidget({ onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Greetings Voyager! I am your Foxico AI Travel Concierge. Ask me to find flights, recommend luxury pool villas in Bali, or build bespoke multi-city itineraries.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await aiApi.travelSearch(userText);
      if (res.success && res.data) {
        const intent = res.data.intent;
        let botReply = `I've analyzed your request for ${intent?.origin || 'your origin'} to ${intent?.destination || 'your destination'}. Found verified routes matching your ${intent?.category || 'multimodal'} preference!`;
        setMessages(prev => [...prev, { role: 'assistant', text: botReply, action: intent?.category }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', text: "I've optimized your voyage preferences. Check out our latest routes!" }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Autonomous itinerary optimizer is ready. Let's explore flights or luxury villas!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-primary hover:bg-primary-container text-on-primary shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 cursor-pointer border border-primary-container"
        title="AI Travel Concierge"
      >
        <span className="material-symbols-outlined text-[24px]">psychology</span>
        <span className="hidden sm:inline font-title-md text-xs font-bold">AI Concierge</span>
      </button>

      {/* Floating Glass Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-96 max-w-[calc(100vw-3rem)] bg-surface-container-low rounded-2xl shadow-2xl border border-surface-container-high/80 overflow-hidden flex flex-col h-[480px]">
          {/* Header */}
          <div className="p-4 bg-surface-container border-b border-surface-container-high flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">auto_awesome</span>
              <div>
                <h4 className="font-title-md text-xs font-bold text-white">Foxico AI Concierge</h4>
                <span className="font-label-sm text-[10px] text-secondary font-semibold">Autonomous Pilot Active</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-on-surface-variant hover:text-white"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 text-xs no-scrollbar">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                  m.role === 'user'
                    ? 'ml-auto bg-primary-container text-on-primary-container font-semibold'
                    : 'bg-surface-container-high text-on-surface'
                }`}
              >
                {m.text}
                {m.action && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onNavigate?.(m.action.toLowerCase() === 'flight' ? 'flights' : m.action.toLowerCase() === 'train' ? 'trains' : m.action.toLowerCase() === 'hotel' ? 'hotels' : 'multimodal');
                    }}
                    className="mt-2 block font-bold text-secondary underline text-[11px]"
                  >
                    View Matching Routes →
                  </button>
                )}
              </div>
            ))}
            {loading && (
              <div className="p-2.5 rounded-xl bg-surface-container-high text-on-surface-variant w-fit flex items-center gap-1.5 text-xs">
                <span className="material-symbols-outlined text-[16px] animate-spin text-primary">sync</span>
                <span>Optimizing routes...</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSend} className="p-3 bg-surface-container border-t border-surface-container-high flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything (e.g. 'Train to Kasaragod')..."
              className="flex-1 bg-surface-container-high px-3 py-2 rounded-xl text-white text-xs focus:outline-none placeholder:text-outline-variant"
            />
            <button
              type="submit"
              disabled={loading}
              className="p-2 rounded-xl bg-primary text-on-primary hover:bg-primary-container transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
