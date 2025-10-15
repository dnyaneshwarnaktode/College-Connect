import { useState, useEffect, useRef } from 'react';
import { Bell, Search, Menu, Clock, GraduationCap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
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
}

export default function Navbar({ sidebarOpen, setSidebarOpen }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery } = useSearch();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications and count
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      setNotificationsLoading(true);
      const token = localStorage.getItem('collegeconnect_token');
      const response = await fetch(`${API_BASE_URL}/notifications?limit=15`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data.notifications.map((n: any) => ({ ...n, timestamp: formatTimestamp(n.createdAt) })));
        setUnreadCount(data.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return notificationTime.toLocaleDateString();
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60 * 1000); // Poll every minute
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchModalOpen(true);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    const notification = notifications.find(n => n._id === notificationId);
    if (!notification || notification.isRead) return;

    try {
      const token = localStorage.getItem('collegeconnect_token');
      await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications(); // Re-fetch to get the latest state
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };


  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-950 border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between px-4 h-16">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu size={22} />
          </button>
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <h1 className="hidden sm:block text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">
              CollegeConnect
            </h1>
          </Link>
        </div>

        {/* Center Section - Search Bar */}
        <div className="hidden md:flex flex-1 justify-center px-8">
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search events, projects, forums..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800/60 border border-transparent dark:border-slate-700/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
            />
          </form>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchModalOpen(true)}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors md:hidden"
            aria-label="Search"
          >
            <Search size={22} />
          </button>

          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors relative
                ${unreadCount > 0 
                  ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
              <Bell size={18} />
              <span className="hidden lg:block">Notifications</span>
               {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-white text-xs ring-2 ring-white dark:ring-gray-950">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 z-50">
                <div className="p-3 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notificationsLoading ? (
                    <div className="p-6 text-center text-slate-400">Loading...</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400"><p className="text-sm">No new notifications</p></div>
                  ) : (
                    <>
                      {/* Unread Notifications */}
                      {notifications.filter(n => !n.isRead).length > 0 && (
                        <>
                          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50">
                            <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">New</h4>
                          </div>
                          {notifications.filter(n => !n.isRead).map((n) => (
                            <div
                              key={n._id}
                              className="p-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer bg-indigo-50 dark:bg-indigo-500/10"
                              onClick={() => {
                                markNotificationAsRead(n._id);
                                if (n.actionUrl) navigate(n.actionUrl);
                                setNotificationsOpen(false);
                              }}
                            >
                              <div className="flex items-start space-x-3">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-slate-600 dark:text-slate-300"><span className="font-semibold text-slate-800 dark:text-slate-100">{n.title}</span> {n.message}</p>
                                  <div className="flex items-center text-xs text-slate-400 dark:text-slate-500 mt-1.5"><Clock size={12} className="mr-1.5" />{n.timestamp}</div>
                                </div>
                                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full flex-shrink-0 mt-1.5 self-center"></div>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                      
                      {/* Past Notifications (Read) */}
                      {notifications.filter(n => n.isRead).length > 0 && (
                        <>
                          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50">
                            <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Earlier</h4>
                          </div>
                          {notifications.filter(n => n.isRead).slice(0, 3).map((n) => (
                            <div
                              key={n._id}
                              className="p-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer opacity-75"
                              onClick={() => {
                                if (n.actionUrl) navigate(n.actionUrl);
                                setNotificationsOpen(false);
                              }}
                            >
                              <div className="flex items-start space-x-3">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-slate-500 dark:text-slate-400"><span className="font-medium text-slate-700 dark:text-slate-300">{n.title}</span> {n.message}</p>
                                  <div className="flex items-center text-xs text-slate-400 dark:text-slate-500 mt-1.5"><Clock size={12} className="mr-1.5" />{n.timestamp}</div>
                                </div>
                                <div className="flex items-center text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                                  <span className="text-xs text-slate-400 dark:text-slate-500">Seen</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                      
                      {/* No notifications message */}
                      {notifications.filter(n => !n.isRead).length === 0 && notifications.filter(n => n.isRead).length === 0 && (
                        <div className="p-6 text-center text-slate-400"><p className="text-sm">No notifications</p></div>
                      )}
                    </>
                  )}
                </div>
                
                {/* Mark all as read button */}
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <div className="p-3 border-t border-slate-200 dark:border-slate-800">
                    <button 
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem('collegeconnect_token');
                          await fetch(`${API_BASE_URL}/notifications/read-all`, {
                            method: 'PUT',
                            headers: { 'Authorization': `Bearer ${token}` }
                          });
                          fetchNotifications(); // Re-fetch to get the latest state
                        } catch (error) {
                          console.error('Error marking all notifications as read:', error);
                        }
                      }}
                      className="w-full text-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
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
            className="flex items-center gap-2 rounded-full text-sm font-medium transition-colors text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 pr-3"
          >
            <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-800 dark:text-white font-semibold">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100 max-w-[100px] truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
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
      <SearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </header>
  );
}