import { useState, useEffect, useRef } from 'react';
import { Bell, Search, Menu, X, Calendar, MessageSquare, FolderOpen, Users, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../../contexts/SearchContext';
import SearchModal from '../SearchModal';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

interface Notification {
  _id: string;
  type: 'event' | 'forum' | 'project' | 'team' | 'system' | 'announcement';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export default function Navbar({ sidebarOpen, setSidebarOpen }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery, performSearch, clearSearch } = useSearch();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchInputFocused, setSearchInputFocused] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      setNotificationsLoading(true);
      const token = localStorage.getItem('collegeconnect_token');
      const response = await fetch(`${API_BASE_URL}/notifications?limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const formattedNotifications = data.data.notifications.map((notification: any) => ({
          ...notification,
          timestamp: formatTimestamp(notification.createdAt)
        }));
        setNotifications(formattedNotifications);
        setUnreadCount(data.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Fetch notification count
  const fetchNotificationCount = async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('collegeconnect_token');
      const response = await fetch(`${API_BASE_URL}/notifications/count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return notificationTime.toLocaleDateString();
  };

  // Load notifications when user is available
  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchNotificationCount();
    }
  }, [user]);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchInputFocused(false);
      }
    };

    if (notificationsOpen || searchInputFocused) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationsOpen, searchInputFocused]);

  // Handle search input changes with debouncing
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    if (query.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(query);
      }, 300);
    } else {
      clearSearch();
    }
  };

  // Handle search input key events
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      e.preventDefault();
      setSearchModalOpen(true);
    }
    if (e.key === 'Escape') {
      setSearchInputFocused(false);
      clearSearch();
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('collegeconnect_token');
      const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => ({
            ...notification,
            isRead: true
          }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('collegeconnect_token');
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => 
            notification._id === notificationId 
              ? { ...notification, isRead: true }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-dark-900 dark:bg-dark-900 border-b border-dark-700 dark:border-dark-700">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-dark-800 dark:hover:bg-dark-800 transition-colors lg:hidden"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="hidden md:block">
            <div className="relative" ref={searchRef}>
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 dark:text-dark-400" />
              <input
                type="text"
                placeholder="Search events, projects, forums..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => setSearchInputFocused(true)}
                className="pl-10 pr-4 py-2 w-64 bg-dark-800 dark:bg-dark-800 border border-dark-700 dark:border-dark-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-darkblue-500 focus:border-transparent transition-colors text-dark-100 dark:text-dark-100 placeholder-dark-400 dark:placeholder-dark-400"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    clearSearch();
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-dark-300 dark:hover:text-dark-300"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Mobile Search Button */}
          <button
            onClick={() => setSearchModalOpen(true)}
            className="p-2 rounded-lg hover:bg-dark-800 dark:hover:bg-dark-800 transition-colors md:hidden"
          >
            <Search size={20} />
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notificationsRef}>
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-lg hover:bg-dark-800 dark:hover:bg-dark-800 transition-colors relative"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-dark-800 dark:bg-dark-800 rounded-lg shadow-lg border border-dark-700 dark:border-dark-700 z-50">
                <div className="p-4 border-b border-dark-700 dark:border-dark-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-dark-100 dark:text-dark-100">Notifications</h3>
                    <button
                      onClick={() => setNotificationsOpen(false)}
                      className="p-1 rounded hover:bg-dark-700 dark:hover:bg-dark-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {notificationsLoading ? (
                    <div className="p-6 text-center text-dark-400 dark:text-dark-400">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-darkblue-600 mx-auto mb-2"></div>
                      <p className="text-sm">Loading notifications...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-6 text-center text-dark-400 dark:text-dark-400">
                      <Bell size={24} className="mx-auto mb-2" />
                      <p className="text-sm">No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification._id}
                        className={`p-3 border-b border-dark-700 dark:border-dark-700 hover:bg-dark-700 dark:hover:bg-dark-700 cursor-pointer ${
                          !notification.isRead ? 'bg-darkblue-900/20 dark:bg-darkblue-900/20' : ''
                        }`}
                        onClick={() => {
                          if (!notification.isRead) {
                            markNotificationAsRead(notification._id);
                          }
                          if (notification.actionUrl) {
                            navigate(notification.actionUrl);
                          }
                          setNotificationsOpen(false);
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-1.5 rounded ${
                            notification.type === 'event' ? 'bg-darkblue-900/30 dark:bg-darkblue-900/30 text-darkblue-400 dark:text-darkblue-400' :
                            notification.type === 'forum' ? 'bg-green-900/30 dark:bg-green-900/30 text-green-400 dark:text-green-400' :
                            notification.type === 'project' ? 'bg-purple-900/30 dark:bg-purple-900/30 text-purple-400 dark:text-purple-400' :
                            notification.type === 'team' ? 'bg-orange-900/30 dark:bg-orange-900/30 text-orange-400 dark:text-orange-400' :
                            notification.type === 'announcement' ? 'bg-yellow-900/30 dark:bg-yellow-900/30 text-yellow-400 dark:text-yellow-400' :
                            'bg-dark-700 dark:bg-dark-700 text-dark-400 dark:text-dark-400'
                          }`}>
                            {notification.type === 'event' && <Calendar size={16} />}
                            {notification.type === 'forum' && <MessageSquare size={16} />}
                            {notification.type === 'project' && <FolderOpen size={16} />}
                            {notification.type === 'team' && <Users size={16} />}
                            {notification.type === 'announcement' && <Bell size={16} />}
                            {notification.type === 'system' && <Bell size={16} />}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-dark-100 dark:text-dark-100">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-dark-300 dark:text-dark-300 mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center text-xs text-dark-400 dark:text-dark-400 mt-1">
                              <Clock size={12} className="mr-1" />
                              {notification.timestamp}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {unreadCount > 0 && (
                  <div className="p-3 border-t border-dark-700 dark:border-dark-700">
                    <button 
                      onClick={markAllAsRead}
                      className="w-full text-center text-sm text-darkblue-400 dark:text-darkblue-400 hover:text-darkblue-300 dark:hover:text-darkblue-300 transition-colors"
                    >
                      Mark all as read
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <button 
            onClick={() => navigate('/settings?tab=profile')}
            className="flex items-center space-x-2 hover:bg-dark-800 dark:hover:bg-dark-800 rounded-lg p-2 transition-colors"
          >
            <div className="w-8 h-8 bg-darkblue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {user?.name.charAt(0)}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-dark-100 dark:text-dark-100">{user?.name}</p>
              <p className="text-xs text-dark-400 dark:text-dark-400 capitalize">{user?.role}</p>
            </div>
          </button>

          <button
            onClick={logout}
            className="px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-900/20 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal 
        isOpen={searchModalOpen} 
        onClose={() => setSearchModalOpen(false)} 
      />
    </header>
  );
}