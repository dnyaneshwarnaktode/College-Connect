import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TeamChat } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface TeamChatPageProps {}

const TeamChatPage: React.FC<TeamChatPageProps> = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<TeamChat[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (teamId) {
      fetchMessages();
    }
  }, [teamId]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('collegeconnect_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/teams/${teamId}/chat`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch(`${API_BASE_URL}/teams/${teamId}/chat`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ message: newMessage })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.data]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const addReaction = async (messageId: string, emoji: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/teams/${teamId}/chat/${messageId}/reaction`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ emoji })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId ? data.data : msg
          )
        );
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Team Chat</h1>
        <p className="text-gray-600">Stay connected with your team members</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === user?.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-900 shadow-sm'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-sm">
                    {message.senderName}
                  </span>
                  <span className="text-xs opacity-75">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm">{message.message}</p>
                
                {/* Reactions */}
                {message.reactions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {message.reactions.map((reaction, index) => (
                      <button
                        key={index}
                        onClick={() => addReaction(message.id, reaction.emoji)}
                        className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded-full transition-colors"
                      >
                        {reaction.emoji} {message.reactions.filter(r => r.emoji === reaction.emoji).length}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white border-t px-6 py-4">
        <form onSubmit={sendMessage} className="flex space-x-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeamChatPage;
