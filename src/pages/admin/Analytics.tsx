import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, Calendar, MessageSquare, FolderOpen, Activity, Eye, Download } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
// no direct type usage from ../../types in this view

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Analytics() {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState('30');

  React.useEffect(() => {
    if (user?.role === 'admin') {
      fetchAnalytics();
    }
  }, [user, timeRange]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('collegeconnect_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/dashboard?days=${timeRange}`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data.stats);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      // no-op
    }
  };

  // Redirect if not admin
  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Access Denied</h3>
        <p className="text-gray-600 dark:text-gray-400">You don't have permission to access this page.</p>
      </div>
    );
  }

  const getAnalyticsData = () => {
    const events = (analyticsData?.events || []) as Array<{ category: string; registered: number }>;
    const posts = (analyticsData?.posts || []) as Array<{ replies: Array<unknown>; likes: number }>;
    const projects = (analyticsData?.projects || []) as Array<{ status: string }>;
    const teams = (analyticsData?.teams || []) as Array<{ isOpen: boolean }>;

    const totalEvents = events.length;
    const totalRegistrations = events.reduce((sum, event) => sum + (event.registered || 0), 0);
    const totalPosts = posts.length;
    const totalReplies = posts.reduce((sum, post) => sum + (post.replies?.length || 0), 0);
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const totalTeams = teams.length;
    const openTeams = teams.filter(t => t.isOpen).length;

    return {
      totalEvents,
      totalRegistrations,
      totalPosts,
      totalReplies,
      totalProjects,
      activeProjects,
      totalTeams,
      openTeams
    };
  };

  const getEventCategoryData = () => {
    const events = (analyticsData?.events || []) as Array<{ category: string }>;
    const categories = events.reduce((acc, event) => {
      acc[event.category] = (acc[event.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categories).map(([category, count]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      count,
      percentage: events.length > 0 ? Math.round((count / events.length) * 100) : 0
    }));
  };

  const getProjectStatusData = () => {
    const projects = (analyticsData?.projects || []) as Array<{ status: string }>;
    const statuses = projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statuses).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      percentage: projects.length > 0 ? Math.round((count / projects.length) * 100) : 0
    }));
  };

  const getEngagementMetrics = () => {
    const posts = (analyticsData?.posts || []) as Array<{ likes: number; replies: Array<unknown> }>;
    const events = (analyticsData?.events || []) as Array<{ registered: number }>;

    const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);
    const avgLikesPerPost = posts.length > 0 ? Math.round(totalLikes / posts.length) : 0;
    const totalReplies = posts.reduce((sum, post) => sum + (post.replies?.length || 0), 0);
    const avgRepliesPerPost = posts.length > 0 ? Math.round(totalReplies / posts.length) : 0;
    const totalRegistrations = events.reduce((sum, event) => sum + (event.registered || 0), 0);
    const avgRegistrationsPerEvent = events.length > 0 ? Math.round(totalRegistrations / events.length) : 0;

    return {
      totalLikes,
      avgLikesPerPost,
      avgRepliesPerPost,
      avgRegistrationsPerEvent
    };
  };

  const analytics = getAnalyticsData();
  const eventCategories = getEventCategoryData();
  const projectStatuses = getProjectStatusData();
  const engagement = getEngagementMetrics();

  const mainStats = [
    { title: 'Total Events', value: analytics.totalEvents, icon: Calendar, color: 'bg-blue-500', change: '+12%' },
    { title: 'Event Registrations', value: analytics.totalRegistrations, icon: Users, color: 'bg-green-500', change: '+8%' },
    { title: 'Forum Posts', value: analytics.totalPosts, icon: MessageSquare, color: 'bg-purple-500', change: '+15%' },
    { title: 'Active Projects', value: analytics.activeProjects, icon: FolderOpen, color: 'bg-orange-500', change: '+5%' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Platform insights and engagement metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            <Download size={18} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat, index) => (
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
        {/* Event Categories */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Event Categories
            </h2>
            <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              <Eye size={16} />
            </button>
          </div>
          <div className="space-y-4">
            {eventCategories.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-green-500' :
                    index === 2 ? 'bg-purple-500' : 'bg-orange-500'
                  }`}></div>
                  <span className="text-gray-900 dark:text-white font-medium">{category.category}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 dark:text-gray-400">{category.count}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-500">({category.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Status */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <FolderOpen className="w-5 h-5 mr-2 text-purple-600" />
              Project Status
            </h2>
            <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              <Eye size={16} />
            </button>
          </div>
          <div className="space-y-4">
            {projectStatuses.map((status, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    status.status === 'Active' ? 'bg-green-500' :
                    status.status === 'Completed' ? 'bg-blue-500' : 'bg-yellow-500'
                  }`}></div>
                  <span className="text-gray-900 dark:text-white font-medium">{status.status}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 dark:text-gray-400">{status.count}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-500">({status.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <Activity className="w-5 h-5 mr-2 text-green-600" />
            Engagement Metrics
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">{engagement.totalLikes}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Likes</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">{engagement.avgLikesPerPost}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Likes/Post</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">{engagement.avgRepliesPerPost}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Replies/Post</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 mb-1">{engagement.avgRegistrationsPerEvent}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Registrations/Event</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <Activity className="w-5 h-5 mr-2 text-orange-600" />
            Recent Activity
          </h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">New event created: "Tech Symposium 2024"</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
              <Users className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">5 new user registrations</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">4 hours ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
              <MessageSquare className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">High activity in "React Development" forum</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">6 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}