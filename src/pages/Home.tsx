import { useNavigate } from 'react-router-dom';
import { Calendar, Users, MessageSquare, FolderOpen, TrendingUp, Sparkles, ArrowRight, BookOpen, Trophy, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Squares from '../components/Squares';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
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
  ];

  const stats = [
    { label: 'Active Students', value: '1,200+', icon: Users, color: 'text-emerald-500' },
    { label: 'Events Hosted', value: '250+', icon: Calendar, color: 'text-violet-500' },
    { label: 'Projects Created', value: '380+', icon: FolderOpen, color: 'text-rose-500' },
    { label: 'Forum Discussions', value: '1,500+', icon: MessageSquare, color: 'text-amber-500' }
  ];

  const quickActions = [
    { icon: BookOpen, label: 'Browse Events', action: () => navigate('/events'), color: 'bg-emerald-500 hover:bg-emerald-600' },
    { icon: Users, label: 'Join a Team', action: () => navigate('/teams'), color: 'bg-violet-500 hover:bg-violet-600' },
    { icon: Trophy, label: 'View Projects', action: () => navigate('/projects'), color: 'bg-rose-500 hover:bg-rose-600' },
    { icon: Zap, label: 'Start Discussion', action: () => navigate('/forums'), color: 'bg-amber-500 hover:bg-amber-600' }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950">
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
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-white font-medium">Welcome to CollegeConnect</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Connect, Collaborate,
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Create Together
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 mb-6 max-w-3xl mx-auto">
            Your ultimate platform for campus engagement, collaboration, and innovation.
            {user && ` Welcome back, ${user.name}!`}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="group px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-base shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center space-x-2 hover:scale-105"
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105"
              >
                <div className="flex flex-col items-center text-center">
                  <stat.icon className={`w-6 h-6 mb-2 ${stat.color}`} />
                  <div className="text-xl md:text-2xl font-bold text-white mb-1 flex items-center">
                    {stat.value}
                    <TrendingUp className="w-4 h-4 ml-1 text-green-400" />
                  </div>
                  <div className="text-xs text-gray-300">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-8">
            Explore Our Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <div 
                key={index}
                onClick={() => navigate(feature.link)}
                className="group bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-300 text-xs leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-3 flex items-center text-blue-400 text-xs font-medium group-hover:text-blue-300">
                  <span>Learn more</span>
                  <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="container mx-auto px-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 text-center">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`${action.color} text-white p-4 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-xl flex flex-col items-center space-y-2`}
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

