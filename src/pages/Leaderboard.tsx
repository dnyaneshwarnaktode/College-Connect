import React, { useState, useEffect } from 'react';
import { UserStats } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface LeaderboardPageProps {}

const LeaderboardPage: React.FC<LeaderboardPageProps> = () => {
  const [leaderboard, setLeaderboard] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overall');
  const [timeframe, setTimeframe] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab, timeframe, currentPage]);

  const fetchLeaderboard = async () => {
    try {
      let url = `${API_BASE_URL}/leaderboard`;
      
      if (activeTab === 'category') {
        url = `${API_BASE_URL}/leaderboard/category/dsa`;
      } else if (activeTab === 'streaks') {
        url = `${API_BASE_URL}/leaderboard/streaks`;
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '50',
        timeframe
      });

      const response = await fetch(`${url}?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.data.leaderboard);
        setTotalPages(data.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-600';
    if (rank === 2) return 'text-gray-600';
    if (rank === 3) return 'text-orange-600';
    return 'text-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🏆 Leaderboard
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Compete with fellow students and climb the rankings! 
              Solve challenges, maintain streaks, and showcase your programming skills.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overall')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overall'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overall Ranking
              </button>
              <button
                onClick={() => setActiveTab('category')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'category'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Category Wise
              </button>
              <button
                onClick={() => setActiveTab('streaks')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'streaks'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Streak Leaders
              </button>
            </nav>
          </div>

          {/* Timeframe Filter */}
          {activeTab === 'overall' && (
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex space-x-4">
                <span className="text-sm font-medium text-gray-700">Timeframe:</span>
                {['all', 'week', 'month'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimeframe(period)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      timeframe === period
                        ? 'bg-blue-100 text-blue-800'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {period === 'all' ? 'All Time' : period === 'week' ? 'This Week' : 'This Month'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Solved
                  </th>
                  {activeTab === 'streaks' ? (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Streak
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Longest Streak
                      </th>
                    </>
                  ) : (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaderboard.map((user, index) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-lg font-bold ${getRankColor(user.rank)}`}>
                        {getRankIcon(user.rank)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {user.userName?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.userName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.user?.year ? `Year ${user.user.year}` : 'Faculty'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-blue-600">
                        {user.totalScore.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.challengesSolved}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.challengesAttempted} attempted
                      </div>
                    </td>
                    {activeTab === 'streaks' ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm font-semibold text-orange-600">
                              {user.currentStreak}
                            </span>
                            <span className="ml-1 text-xs text-gray-500">days</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm font-semibold text-purple-600">
                              {user.longestStreak}
                            </span>
                            <span className="ml-1 text-xs text-gray-500">days</span>
                          </div>
                        </td>
                      </>
                    ) : (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.user?.department || 'N/A'}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 border rounded-md ${
                      page === currentPage
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
