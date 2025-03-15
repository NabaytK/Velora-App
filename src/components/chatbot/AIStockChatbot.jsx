"use client";

import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import { X, Send, Maximize2, Minimize2 } from 'lucide-react';

// Helper function to generate a unique client ID
const generateClientId = () => {
  return 'client_' + Math.random().toString(36).substring(2, 15);
};

const AIStockChatbot = ({ ticker }) => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: `Hello! I'm your AI stock prediction assistant. I can help analyze ${ticker || 'stocks'}, explain price forecasts, and answer any questions you might have. How can I help you today?`, 
      isUser: false, 
      timestamp: new Date().toISOString() 
    }
  ]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef(null);
  const clientId = useRef(generateClientId());
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Connect to WebSocket
    const connectWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/chat/${clientId.current}`;
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'bot_response') {
            setIsTyping(false);
            setMessages(prev => [
              ...prev,
              {
                id: Date.now(),
                text: data.message,
                isUser: false,
                timestamp: data.timestamp || new Date().toISOString()
              }
            ]);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        // Try to reconnect after a delay
        setTimeout(connectWebSocket, 3000);
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        ws.close();
      };
      
      socketRef.current = ws;
    };
    
    connectWebSocket();
    
    // Cleanup on unmount
    return () => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending message
  const sendMessage = (e) => {
    e?.preventDefault();
    
    if (!input.trim() || !isConnected) return;
    
    const userMessage = {
      id: Date.now(),
      text: input,
      isUser: true,
      timestamp: new Date().toISOString()
    };
    
    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    
    // Show typing indicator
    setIsTyping(true);
    
    // Send message to server
    const messageToSend = {
      message: input,
      ticker: ticker || null
    };
    
    socketRef.current.send(JSON.stringify(messageToSend));
    
    // Clear input
    setInput('');
  };

  // If WebSocket isn't available, use REST API as fallback
  const sendMessageFallback = async () => {
    if (!input.trim()) return;
    
    const userMessage = {
      id: Date.now(),
      text: input,
      isUser: true,
      timestamp: new Date().toISOString()
    };
    
    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      // Use REST API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input, ticker }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const data = await response.json();
      
      // Add bot response
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          text: data.response,
          isUser: false,
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          text: "Sorry, I'm having trouble connecting to the server. Please try again later.",
          isUser: false,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsTyping(false);
      setInput('');
    }
  };
  
  // Handle toggle minimizing the chat
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };
  
  return (
    <div className="fixed bottom-4 right-4 flex flex-col w-80 md:w-96 shadow-xl rounded-lg overflow-hidden z-50 bg-white border border-gray-200">
      {/* Chat Header */}
      <div className="bg-indigo-600 text-white px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <div className="mr-2 h-2 w-2 rounded-full bg-green-400"></div>
          <h3 className="font-medium">Stock AI Assistant</h3>
          {ticker && <span className="ml-2 px-2 py-0.5 text-xs bg-indigo-800 rounded-full">{ticker}</span>}
        </div>
        <div className="flex space-x-1">
          <button 
            onClick={toggleMinimize} 
            className="p-1 rounded hover:bg-indigo-700 transition-colors"
          >
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button 
            onClick={toggleMinimize}
            className="p-1 rounded hover:bg-indigo-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>
      
      {/* Chat Body */}
      {!isMinimized && (
        <>
          <div className="flex-1 h-96 p-4 overflow-y-auto bg-white">
            {messages.map(message => (
              <ChatMessage 
                key={message.id} 
                message={message} 
                isUser={message.isUser} 
              />
            ))}
            
            {isTyping && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg rounded-bl-none">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-75"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-150"></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Chat Input */}
          <form onSubmit={sendMessage} className="p-2 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center">
              <input
                type="text"
                id="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about stock predictions..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white p-2 rounded-r-md hover:bg-indigo-700 transition-colors"
                disabled={!input.trim()}
              >
                <Send size={20} />
              </button>
            </div>
            {!isConnected && (
              <div className="text-xs text-red-500 mt-1 text-center">
                Connecting to server...
              </div>
            )}
          </form>
        </>
      )}
    </div>
  );
};

export default AIStockChatbot;
