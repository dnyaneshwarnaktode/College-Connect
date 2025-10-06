import { useState, useEffect, useRef } from 'react';
import { Bell, Search, Menu, X, Calendar, MessageSquare, FolderOpen, Users, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

interface Notification {
  id: string;
  type: 'event' | 'forum' | 'project' | 'team';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

export default function Navbar({ sidebarOpen, setSidebarOpen }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'event',
      title: 'New Event Posted',
      message: 'Tech Talk: AI in Web Development has been posted',
      timestamp: '2 minutes ago',
      isRead: false,
      actionUrl: '/events'
    },
    {
      id: '2',
      type: 'forum',
      title: 'New Reply',
      message: 'John Doe replied to your post "Best practices for React"',
      timestamp: '15 minutes ago',
      isRead: false,
      actionUrl: '/forums'
    },
    {
      id: '3',
      type: 'project',
      title: 'Project Update',
      message: 'Your project "E-commerce Platform" has been approved',
      timestamp: '1 hour ago',
      isRead: true,
      actionUrl: '/projects'
    },
    {
      id: '4',
      type: 'team',
      title: 'Team Invitation',
      message: 'You have been invited to join "Web Development Team"',
      timestamp: '3 hours ago',
      isRead: false,
      actionUrl: '/teams'
    },
    {
      id: '5',
      type: 'event',
      title: 'Event Reminder',
      message: 'Coding Competition starts in 2 hours',
      timestamp: '5 hours ago',
      isRead: true,
      actionUrl: '/events'
    }
  ]);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationsOpen]);

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="hidden md:block">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 w-64 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Notifications Dropdown */}
          <div className="relative" ref={notificationsRef}>
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
            >
              <Bell size={20} />
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    <button
                      onClick={() => setNotificationsOpen(false)}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                      <Bell size={24} className="mx-auto mb-2" />
                      <p className="text-sm">No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                          !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                        onClick={() => {
                          if (notification.actionUrl) {
                            window.location.href = notification.actionUrl;
                          }
                          setNotificationsOpen(false);
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-1.5 rounded ${
                            notification.type === 'event' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' :
                            notification.type === 'forum' ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' :
                            notification.type === 'project' ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400' :
                            'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400'
                          }`}>
                            {notification.type === 'event' && <Calendar size={16} />}
                            {notification.type === 'forum' && <MessageSquare size={16} />}
                            {notification.type === 'project' && <FolderOpen size={16} />}
                            {notification.type === 'team' && <Users size={16} />}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                              <Clock size={12} className="mr-1" />
                              {notification.timestamp}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                    <button className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                      Mark all as read
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <button 
            onClick={() => navigate('/settings?tab=profile')}
            className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-2 transition-colors"
          >
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {user?.name.charAt(0)}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
            </div>
          </button>

          <button
            onClick={logout}
            className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}