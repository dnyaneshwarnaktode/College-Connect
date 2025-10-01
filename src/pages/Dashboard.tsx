import React from 'react';
import { Calendar, Users, MessageSquare, FolderOpen, TrendingUp, Clock, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Event, ForumPost, Project } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [events, setEvents] = React.useState<Event[]>([]);
  const [posts, setPosts] = React.useState<ForumPost[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  // teams are not used on this dashboard view

  React.useEffect(() => {
    fetchDashboardData();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('collegeconnect_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  const fetchDashboardData = async () => {
    try {
      const [eventsRes, postsRes, projectsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/events?limit=3`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE_URL}/forums?limit=3`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE_URL}/projects?limit=3`, { headers: getAuthHeaders() })
      ]);

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData.events || []);
      }

      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData.posts || []);
      }

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setProjects(projectsData.projects || []);
      }

      // no teams used
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      // no-op
    }
  };

  const getDashboardStats = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { title: 'Total Users', value: '1,245', icon: Users, color: 'bg-blue-500', change: '+12%' },
          { title: 'Active Events', value: events.length.toString(), icon: Calendar, color: 'bg-green-500', change: '+8%' },
          { title: 'Forum Posts', value: posts.length.toString(), icon: MessageSquare, color: 'bg-purple-500', change: '+15%' },
          { title: 'Projects', value: projects.length.toString(), icon: FolderOpen, color: 'bg-orange-500', change: '+5%' },
        ];
      case 'faculty':
        return [
          { title: 'My Events', value: '3', icon: Calendar, color: 'bg-blue-500', change: '+2' },
          { title: 'Students Mentored', value: '24', icon: Users, color: 'bg-green-500', change: '+3' },
          { title: 'Projects Supervised', value: '6', icon: FolderOpen, color: 'bg-purple-500', change: '+1' },
          { title: 'Forum Contributions', value: '18', icon: MessageSquare, color: 'bg-orange-500', change: '+4' },
        ];
      default:
        return [
          { title: 'Events Attended', value: '8', icon: Calendar, color: 'bg-blue-500', change: '+2' },
          { title: 'Teams Joined', value: '3', icon: Users, color: 'bg-green-500', change: '+1' },
          { title: 'Projects Active', value: '2', icon: FolderOpen, color: 'bg-purple-500', change: '+1' },
          { title: 'Forum Posts', value: '12', icon: MessageSquare, color: 'bg-orange-500', change: '+3' },
        ];
    }
  };

  const stats = getDashboardStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Here's what's happening in your college community
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <div className="flex items-center mt-2">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <span className="ml-2 text-sm text-green-600 font-medium flex items-center">
                    <TrendingUp size={14} className="mr-1" />
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Events */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Upcoming Events
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {events.slice(0, 3).map((event) => (
              <div key={event.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {event.title}
                  </p>
                  <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4 mr-1" />
                    {new Date(event.date).toLocaleDateString()} at {event.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Projects */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <FolderOpen className="w-5 h-5 mr-2 text-purple-600" />
              Recent Projects
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {projects.slice(0, 3).map((project) => (
              <div key={project.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                  <FolderOpen className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {project.title}
                  </p>
                  <div className="flex items-center mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      project.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      project.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Star className="w-5 h-5 mr-2 text-yellow-600" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/events" className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-left">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-900 dark:text-white">Create Event</span>
          </a>
          <a href="/projects" className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-left">
            <FolderOpen className="w-5 h-5 text-green-600" />
            <span className="font-medium text-gray-900 dark:text-white">Start Project</span>
          </a>
          <a href="/teams" className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-left">
            <Users className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-gray-900 dark:text-white">Join Team</span>
          </a>
        </div>
      </div>
    </div>
  );
}