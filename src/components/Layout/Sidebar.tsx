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
  Bot,
  Bell // <-- Added Bell icon import
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AIAssistant from '../AIAssistant';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const { user, logout } = useAuth();
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const onClose = () => setSidebarOpen(false);

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
      // NEW: Notifications link added here
      { name: 'Notifications', icon: Bell, path: '/notifications' }
    );

    return baseItems;
  };

  const navItems = getNavigationItems();

  return (
    <>
      {/* Click-outside overlay for all screen sizes */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 lg:bg-transparent"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 z-40 w-64 bg-white dark:bg-gray-950 border-r border-slate-200 dark:border-slate-800
        transform transition-transform duration-300 ease-in-out
        top-16 h-[calc(100vh-4rem)] 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Mobile close button */}
        <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        >
            <X size={20} />
        </button>
        
        <div className="flex flex-col h-full">
          {/* New Sidebar Heading */}
          <div className="px-4 pt-6 pb-2">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Menu
            </h2>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group text-sm font-medium ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`
                }
              >
                <item.icon size={20} className="flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setIsAIAssistantOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors duration-200 group text-sm font-medium"
            >
              <Bot size={20} className="flex-shrink-0" />
              <span>AI Assistant</span>
            </button>
            
            <NavLink
              to="/settings"
              onClick={onClose}
              className="w-full flex items-center gap-3 px-3 py-2.5 mt-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 group text-sm font-medium"
            >
              <Settings size={20} className="flex-shrink-0" />
              <span>Settings</span>
            </NavLink>

            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 mt-1 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-200 group text-sm font-medium"
            >
              <LogOut size={20} className="flex-shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <AIAssistant 
        isOpen={isAIAssistantOpen} 
        onClose={() => setIsAIAssistantOpen(false)} 
      />
    </>
  );
}