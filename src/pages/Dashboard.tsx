import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, Users, MessageSquare, FolderOpen, TrendingUp, Clock, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Event, ForumPost, Project } from '../types';
import { CardSkeleton, ListSkeleton } from '../components/Skeleton';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function Dashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('collegeconnect_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      const headers = getAuthHeaders();
      const [eventsRes, postsRes, projectsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/events?limit=5`, { headers }),
        fetch(`${API_BASE_URL}/forums?limit=5`, { headers }),
        fetch(`${API_BASE_URL}/projects?limit=5`, { headers })
      ]);

      const [eventsData, postsData, projectsData] = await Promise.all([
        eventsRes.json(),
        postsRes.json(),
        projectsRes.json()
      ]);

      if (eventsData.success) setEvents(eventsData.events);
      if (postsData.success) setPosts(postsData.posts);
      if (projectsData.success) setProjects(projectsData.projects);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, getAuthHeaders]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getDashboardStats = useMemo(() => {
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
  }, [user?.role, events.length, posts.length, projects.length]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark-100 dark:text-dark-100">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-dark-300 dark:text-dark-300 mt-1">
          Here's what's happening in your college community
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))
        ) : (
          getDashboardStats.map((stat, index) => (
            <div key={`${stat.title}-${index}`} className="bg-dark-800 dark:bg-dark-800 p-6 rounded-xl shadow-sm border border-dark-700 dark:border-dark-700 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400 dark:text-dark-400">
                    {stat.title}
                  </p>
                  <div className="flex items-center mt-2">
                    <p className="text-2xl font-bold text-dark-100 dark:text-dark-100">
                      {stat.value}
                    </p>
                    <span className="ml-2 text-sm text-green-400 font-medium flex items-center">
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
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Events */}
        <div className="bg-dark-800 dark:bg-dark-800 rounded-xl shadow-sm border border-dark-700 dark:border-dark-700">
          <div className="p-6 border-b border-dark-700 dark:border-dark-700">
            <h2 className="text-xl font-semibold text-dark-100 dark:text-dark-100 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-darkblue-600" />
              Upcoming Events
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {loading ? (
              <ListSkeleton items={3} />
            ) : events.length === 0 ? (
              <p className="text-dark-400 dark:text-dark-400 text-center py-8">
                No upcoming events
              </p>
            ) : (
              events.slice(0, 3).map((event) => (
                <div key={event.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-dark-700 dark:hover:bg-dark-700 transition-colors">
                  <div className="bg-darkblue-100 dark:bg-darkblue-900/30 p-2 rounded-lg">
                    <Calendar className="w-4 h-4 text-darkblue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark-100 dark:text-dark-100 truncate">
                      {event.title}
                    </p>
                    <div className="flex items-center mt-1 text-sm text-dark-400 dark:text-dark-400">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(event.date).toLocaleDateString()} at {event.time}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Projects */}
        <div className="bg-dark-800 dark:bg-dark-800 rounded-xl shadow-sm border border-dark-700 dark:border-dark-700">
          <div className="p-6 border-b border-dark-700 dark:border-dark-700">
            <h2 className="text-xl font-semibold text-dark-100 dark:text-dark-100 flex items-center">
              <FolderOpen className="w-5 h-5 mr-2 text-purple-600" />
              Recent Projects
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {loading ? (
              <ListSkeleton items={3} />
            ) : projects.length === 0 ? (
              <p className="text-dark-400 dark:text-dark-400 text-center py-8">
                No recent projects
              </p>
            ) : (
              projects.slice(0, 3).map((project) => (
                <div key={project.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-dark-700 dark:hover:bg-dark-700 transition-colors">
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                    <FolderOpen className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark-100 dark:text-dark-100 truncate">
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
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-darkblue-900/40 to-dark-800/60 backdrop-blur-md rounded-xl shadow-2xl border border-darkblue-700/30 p-6">
        <h2 className="text-xl font-semibold text-dark-100 dark:text-dark-100 mb-4 flex items-center">
          <Star className="w-5 h-5 mr-2 text-darkblue-400" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/events" className="bg-darkblue-900/30 hover:bg-darkblue-900/40 transition-colors text-left border border-darkblue-700/20 rounded-lg p-4 group">
            <Calendar className="w-6 h-6 text-darkblue-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-dark-100 dark:text-dark-100">Browse Events</span>
          </a>
          <a href="/projects" className="bg-green-900/30 hover:bg-green-900/40 transition-colors text-left border border-green-700/20 rounded-lg p-4 group">
            <FolderOpen className="w-6 h-6 text-green-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-dark-100 dark:text-dark-100">View Projects</span>
          </a>
          <a href="/forums" className="bg-purple-900/30 hover:bg-purple-900/40 transition-colors text-left border border-purple-700/20 rounded-lg p-4 group">
            <MessageSquare className="w-6 h-6 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-dark-100 dark:text-dark-100">Start Discussion</span>
          </a>
          <a href="/teams" className="bg-darkblue-900/30 hover:bg-darkblue-900/40 transition-colors text-left border border-darkblue-700/20 rounded-lg p-4 group">
            <Users className="w-6 h-6 text-darkblue-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-dark-100 dark:text-dark-100">Join Team</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default React.memo(Dashboard);