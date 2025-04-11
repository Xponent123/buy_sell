import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, MinusSquare } from 'lucide-react';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeSession = () => {
    let storedSessionId = localStorage.getItem('chatbotSessionId');
    
    if (!storedSessionId) {
      storedSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('chatbotSessionId', storedSessionId);
    }
    
    setSessionId(storedSessionId);
  };

  const   fetchChatHistory = async (session) => {
    try {
      const response = await fetch('http://localhost:8000/api/chatbot/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session }),
      });

      const data = await response.json();
      if (data.success) {
        setMessages(data.history);
      } else {
        setMessages([{ type: 'bot', content: 'Hello! How can I help you today with your shopping experience?' }]);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
      setMessages([{ type: 'bot', content: 'Hello! How can I help you today with your shopping experience?' }]);
    }
  };

  const handleOpenChatbot = async () => {
    setIsOpen(true);

    if (!sessionId) {
      initializeSession();
    }

    const storedSessionId = localStorage.getItem('chatbotSessionId');
    if (storedSessionId) {
      await fetchChatHistory(storedSessionId);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const currentMessages = [...messages, { type: 'user', content: inputMessage }];
    setMessages(currentMessages);
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:8000/api/chatbot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: inputMessage,
          sessionId: sessionId, 
          conversationHistory: currentMessages.slice(-5) 
        }),
      });

      const data = await response.json();
      setIsTyping(false);

      if (data.success) {
        setMessages(prev => [...prev, { type: 'bot', content: data.response }]);
      } else {
        setMessages(prev => [...prev, { type: 'bot', content: 'Sorry, I encountered an error. Please try again.' }]);
      }
    } catch (error) {
      setIsTyping(false);
      setMessages(prev => [...prev, { type: 'bot', content: 'Sorry, I encountered an error. Please try again.' }]);
    }

    setInputMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && !isMinimized && (
        <button
          onClick={handleOpenChatbot}
          className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl w-80 max-w-full flex flex-col">
      
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold">Community Support</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setIsMinimized(true);
                  setIsOpen(false);
                }}
                className="hover:bg-blue-700 p-1 rounded"
              >
                <MinusSquare size={16} />
              </button>
              <button 
                onClick={handleClose}
                className="hover:bg-blue-700 p-1 rounded"
              >
                <X size={16} />
              </button>
            </div>
          </div>

  
          <div className="flex-1 p-4 overflow-y-auto max-h-96 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

      
          <div className="border-t p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-600"
              />
              <button
                onClick={handleSendMessage}
                className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {isMinimized && (
        <button
          onClick={() => {
            setIsMinimized(false);
            handleOpenChatbot();
          }}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <MessageSquare size={20} />
          <span>Community Support</span>
        </button>
      )}
    </div>
  );
};

export default Chatbot;
