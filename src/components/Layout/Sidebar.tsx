import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { 
  Home, 
  Calendar, 
  MessageSquare, 
  FolderOpen, 
  Users, 
  Settings,
  GraduationCap,
  Shield,
  BookOpen,
  X,
  LogOut,
  School,
  Bot
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AIAssistant from '../AIAssistant';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Home', icon: Home, path: '/' },
      { name: 'Events', icon: Calendar, path: '/events' },
      { name: 'Forums', icon: MessageSquare, path: '/forums' },
      { name: 'Projects', icon: FolderOpen, path: '/projects' },
      { name: 'Teams', icon: Users, path: '/teams' },
    ];

    // Add class groups for faculty and students
    if (user?.role === 'faculty' || user?.role === 'student') {
      baseItems.push({ name: 'Class Groups', icon: School, path: '/class-groups' });
    }

    if (user?.role === 'admin') {
      baseItems.push(
        { name: 'User Management', icon: Shield, path: '/admin/users' },
        { name: 'Analytics', icon: BookOpen, path: '/admin/analytics' }
      );
    }

    baseItems.push(
      { name: 'Dashboard', icon: GraduationCap, path: '/dashboard' },
      { name: 'Settings', icon: Settings, path: '/settings' }
    );

    return baseItems;
  };

  const navItems = getNavigationItems();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
        transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">CollegeConnect</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Student Platform</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`
                }
              >
                <item.icon size={20} />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <button
              onClick={() => setIsAIAssistantOpen(true)}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <Bot size={20} />
              <span className="font-medium">AI Assistant</span>
            </button>
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* AI Assistant Modal */}
      <AIAssistant 
        isOpen={isAIAssistantOpen} 
        onClose={() => setIsAIAssistantOpen(false)} 
      />
    </>
  );
}