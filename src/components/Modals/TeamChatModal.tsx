import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Users, Crown, MoreVertical, Smile, Paperclip, Mic } from 'lucide-react';
import { Team } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  isLeader?: boolean;
  type?: 'text' | 'system';
}

interface TeamChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team;
}

export default function TeamChatModal({ isOpen, onClose, team }: TeamChatModalProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sample messages for demonstration
  useEffect(() => {
    if (isOpen && team) {
      const sampleMessages: Message[] = [
        {
          id: '1',
          text: `Welcome to ${team.name}! Let's start collaborating!`,
          senderId: team.leader,
          senderName: team.leaderName,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          isLeader: true,
          type: 'system'
        },
        {
          id: '2',
          text: 'Hey everyone! Excited to work on this project together.',
          senderId: team.members[0] || '',
          senderName: 'Alex Johnson',
          timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
          type: 'text'
        },
        {
          id: '3',
          text: 'Same here! What should we focus on first?',
          senderId: team.members[1] || '',
          senderName: 'Sarah Wilson',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          type: 'text'
        },
        {
          id: '4',
          text: 'I think we should start with the planning phase and break down the tasks.',
          senderId: team.leader,
          senderName: team.leaderName,
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          isLeader: true,
          type: 'text'
        },
        {
          id: '5',
          text: 'Great idea! I can help with the technical architecture.',
          senderId: user?.id || '',
          senderName: user?.name || 'You',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          type: 'text'
        }
      ];
      setMessages(sampleMessages);
    }
  }, [isOpen, team, user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSendMessage = () => {
    if (newMessage.trim() && user) {
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage.trim(),
        senderId: user.id,
        senderName: user.name,
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Simulate typing indicator
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        // Simulate a response (optional)
        if (Math.random() > 0.7) {
          const responses = [
            "That sounds good!",
            "I agree with that approach.",
            "Let me know if you need any help.",
            "Great point!",
            "I'll work on that."
          ];
          const randomResponse = responses[Math.floor(Math.random() * responses.length)];
          const responseMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: randomResponse,
            senderId: team.members[Math.floor(Math.random() * team.members.length)] || team.leader,
            senderName: team.members[Math.floor(Math.random() * team.members.length)] ? 'Team Member' : team.leaderName,
            timestamp: new Date().toISOString(),
            isLeader: Math.random() > 0.5,
            type: 'text'
          };
          setMessages(prev => [...prev, responseMessage]);
        }
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getMessageAlignment = (message: Message) => {
    return message.senderId === user?.id ? 'flex-row-reverse' : 'flex-row';
  };

  const getMessageStyle = (message: Message) => {
    const isOwn = message.senderId === user?.id;
    const baseStyle = "max-w-xs lg:max-w-md px-4 py-2 rounded-2xl";
    
    if (message.type === 'system') {
      return `${baseStyle} bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-center mx-auto`;
    }
    
    if (isOwn) {
      return `${baseStyle} bg-blue-600 text-white`;
    } else {
      return `${baseStyle} bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-dark-900/75 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block w-full max-w-4xl h-[80vh] my-8 overflow-hidden text-left align-middle transition-all transform bg-dark-800 dark:bg-dark-800 shadow-xl rounded-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{team.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <MoreVertical size={20} />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            {messages.map((message) => (
              <div key={message.id} className={`flex items-start space-x-3 ${getMessageAlignment(message)}`}>
                {message.type !== 'system' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                      {message.isLeader ? (
                        <Crown className="w-4 h-4 text-yellow-400" />
                      ) : (
                        <span className="text-white text-xs font-semibold">
                          {message.senderName.charAt(0)}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                <div className={`flex flex-col ${message.senderId === user?.id ? 'items-end' : 'items-start'}`}>
                  {message.type !== 'system' && (
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {message.senderName}
                      </span>
                      {message.isLeader && (
                        <Crown className="w-3 h-3 text-yellow-500" />
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  )}
                  
                  <div className={getMessageStyle(message)}>
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">T</span>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <Paperclip size={20} />
              </button>
              
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <Smile size={20} />
              </button>
              
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <Mic size={20} />
              </button>
              
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-2xl transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
