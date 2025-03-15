'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function ChatInterface() {
  const [messages, setMessages] = useState([
    {
      id: 0,
      text: "Hello! I'm your AI Stock Trading Assistant. What would you like to know?",
      sender: 'ai'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: trimmedMessage,
      sender: 'user'
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        text: `You said: ${trimmedMessage}. Here's a sample response about your query.`,
        sender: 'ai'
      };
      
      setMessages(prevMessages => [...prevMessages, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="chat-interface h-[500px] flex flex-col">
      <div className="flex-grow overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`mb-4 flex ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div 
              className={`max-w-[70%] p-3 rounded-lg ${
                message.sender === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white border border-gray-200 text-gray-800'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="flex space-x-2">
        <input 
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask about stocks, trading strategies..."
          disabled={isLoading}
          className="flex-grow p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          type="submit" 
          disabled={isLoading || !inputMessage.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

