import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, Users, MessageSquare, FolderOpen, TrendingUp, ArrowRight, BookOpen, Trophy, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Squares from '../components/Squares';
import Logo from '../components/Logo';
import { StatsSkeleton } from '../components/Skeleton';
import React from 'react';


function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalProjects: 0,
    totalPosts: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/analytics/public-stats`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      } else {
        setError('Failed to load statistics');
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchStats]);

  const features = useMemo(() => [
    {
      icon: Calendar,
      title: 'Events & Activities',
      description: 'Discover and participate in exciting campus events, workshops, and seminars.',
      color: 'from-emerald-500 to-teal-600',
      link: '/events'
    },
    {
      icon: Users,
      title: 'Teams & Collaboration',
      description: 'Join teams, collaborate with peers, and work on amazing projects together.',
      color: 'from-violet-500 to-purple-600',
      link: '/teams'
    },
    {
      icon: FolderOpen,
      title: 'Project Showcase',
      description: 'Share your innovative projects and get inspired by others\' work.',
      color: 'from-rose-500 to-pink-600',
      link: '/projects'
    },
    {
      icon: MessageSquare,
      title: 'Discussion Forums',
      description: 'Engage in meaningful discussions, ask questions, and share knowledge.',
      color: 'from-amber-500 to-orange-600',
      link: '/forums'
    }
  ], []);

  const statsData = useMemo(() => [
    { label: 'Active Students', value: loading ? '...' : `${stats.totalUsers.toLocaleString()}+`, icon: Users, color: 'text-emerald-500' },
    { label: 'Events Hosted', value: loading ? '...' : `${stats.totalEvents.toLocaleString()}+`, icon: Calendar, color: 'text-violet-500' },
    { label: 'Projects Created', value: loading ? '...' : `${stats.totalProjects.toLocaleString()}+`, icon: FolderOpen, color: 'text-rose-500' },
    { label: 'Forum Discussions', value: loading ? '...' : `${stats.totalPosts.toLocaleString()}+`, icon: MessageSquare, color: 'text-amber-500' }
  ], [stats, loading]);

  const quickActions = useMemo(() => [
    { icon: BookOpen, label: 'Browse Events', action: () => navigate('/events'), color: 'bg-darkblue-600 hover:bg-darkblue-700' },
    { icon: Users, label: 'Join a Team', action: () => navigate('/teams'), color: 'bg-purple-600 hover:bg-purple-700' },
    { icon: Trophy, label: 'View Projects', action: () => navigate('/projects'), color: 'bg-rose-600 hover:bg-rose-700' },
    { icon: Zap, label: 'Start Discussion', action: () => navigate('/forums'), color: 'bg-amber-600 hover:bg-amber-700' }
  ], [navigate]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-dark-950 via-darkblue-950 to-dark-900 dark:from-dark-950 dark:via-darkblue-950 dark:to-dark-900">
        <Squares 
          speed={0.5} 
          squareSize={40}
          direction='diagonal'
          borderColor='rgba(255, 255, 255, 0.1)'
          hoverFillColor='rgba(59, 130, 246, 0.3)'
        />
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-12 pb-12 pt-20">
        {/* Hero Section */}
        <div className="text-center pt-12 pb-8 px-4">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20">
            <Logo size="sm" />
            <span className="text-sm text-white font-medium">Welcome to CollegeConnect</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Connect, Collaborate,
            <br />
            <span className="bg-gradient-to-r from-darkblue-400 via-blue-400 to-darkblue-300 bg-clip-text text-transparent">
              Create Together
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-dark-300 mb-6 max-w-3xl mx-auto">
            Your ultimate platform for campus engagement, collaboration, and innovation.
            {user && ` Welcome back, ${user.name}!`}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="group px-6 py-3 bg-gradient-to-r from-darkblue-500 to-blue-600 text-white rounded-xl font-semibold text-base shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center space-x-2 hover:scale-105"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => navigate('/events')}
              className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold text-base border-2 border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              Explore Events
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="container mx-auto px-4">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-center">
              {error}
              <button 
                onClick={fetchStats}
                className="ml-2 underline hover:text-red-200"
              >
                Retry
              </button>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {loading ? (
              <StatsSkeleton count={4} />
            ) : (
              statsData.map((stat, index) => (
                <div 
                  key={index}
                  className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105"
                >
                  <div className="flex flex-col items-center text-center">
                    <stat.icon className={`w-6 h-6 mb-2 ${stat.color}`} />
                    <div className="text-xl md:text-2xl font-bold text-white mb-1 flex items-center">
                      {stat.value}
                      {!loading && <TrendingUp className="w-4 h-4 ml-1 text-green-400" />}
                    </div>
                    <div className="text-xs text-dark-300">{stat.label}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="container mx-auto px-4">
          <div className="bg-dark-800/80 backdrop-blur-md rounded-2xl p-8 border border-dark-700/50 shadow-2xl">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-dark-100 mb-8">
              Explore Our Features
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  onClick={() => navigate(feature.link)}
                  className="group bg-dark-700/50 backdrop-blur-md p-4 rounded-xl border border-dark-600/50 hover:bg-dark-600/50 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-dark-100 mb-2 group-hover:text-darkblue-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-dark-300 text-xs leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="mt-3 flex items-center text-darkblue-400 text-xs font-medium group-hover:text-darkblue-300">
                    <span>Learn more</span>
                    <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="container mx-auto px-4">
          <div className="bg-transparent backdrop-blur-md rounded-2xl p-6 border border-darkblue-700/30 shadow-2xl">
            <h2 className="text-xl md:text-2xl font-bold text-dark-100 mb-4 text-center">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`${action.color} text-white p-4 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-xl flex flex-col items-center space-y-2 border border-white/20`}
                >
                  <action.icon className="w-6 h-6" />
                  <span className="font-semibold text-xs md:text-sm">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default React.memo(Home);