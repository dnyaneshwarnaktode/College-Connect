import React, { useState } from 'react';
import { Users, Crown, Plus, Search, Filter, Calendar, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import TeamModal from '../components/Modals/TeamModal';
import { Team } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Teams() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  // removed unused loading state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | undefined>();
  const [joinedTeams, setJoinedTeams] = useState<string[]>([]);

  React.useEffect(() => {
    fetchTeams();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('collegeconnect_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  const fetchTeams = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/teams`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setTeams(data.teams || []);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      // no-op
    }
  };

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || team.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleCreateTeam = () => {
    setSelectedTeam(undefined);
    setIsModalOpen(true);
  };

  const handleEditTeam = (team: Team) => {
    setSelectedTeam(team);
    setIsModalOpen(true);
  };

  const handleSaveTeam = (teamData: Partial<Team>) => {
    if (selectedTeam) {
      // Edit existing team
      setTeams(teams.map(team => 
        team.id === selectedTeam.id 
          ? { ...team, ...teamData }
          : team
      ));
    } else {
      // Create new team
      const { id: _ignoredId, ...restTeamData } = (teamData || {}) as Team;
      const newTeam: Team = {
        ...restTeamData,
        id: Date.now().toString(),
        leader: user?.id || '1',
        leaderName: user?.name || 'Anonymous',
        members: [user?.id || '1'],
        createdAt: new Date().toISOString()
      };
      setTeams([...teams, newTeam]);
    }
  };

  const handleJoinTeam = (teamId: string) => {
    if (!joinedTeams.includes(teamId)) {
      setJoinedTeams([...joinedTeams, teamId]);
      setTeams(teams.map(team => 
        team.id === teamId 
          ? { ...team, members: [...team.members, user?.id || '1'] }
          : team
      ));
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'club': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'project': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'competition': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Teams</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Join or create teams for projects and activities</p>
        </div>
        <button 
          onClick={handleCreateTeam}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={18} />
          <span>Create Team</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-10 pr-8 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[140px]"
            >
              <option value="all">All Types</option>
              <option value="club">Club</option>
              <option value="project">Project</option>
              <option value="competition">Competition</option>
            </select>
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map((team) => (
          <div key={team.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(team.type)}`}>
                    {team.type}
                  </span>
                  {team.isOpen ? (
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Open
                    </span>
                  ) : (
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                      Closed
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {team.name}
                </h3>
              </div>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Users size={16} className="mr-1" />
                {team.members.length}/{team.maxMembers}
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
              {team.description}
            </p>

            <div className="mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                <Crown size={16} />
                <span>Leader: {team.leaderName}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                <Calendar size={16} />
                <span>Created: {new Date(team.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {team.tags.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {team.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-md">
                      {tag}
                    </span>
                  ))}
                  {team.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-md">
                      +{team.tags.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <div className="flex space-x-2 flex-1">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium">
                  View Details
                </button>
                {team.leader === user?.id && (
                  <button
                    onClick={() => handleEditTeam(team)}
                    className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
                  >
                    Edit
                  </button>
                )}
              </div>
              {team.isOpen && team.members.length < team.maxMembers && (
                <button 
                  onClick={() => handleJoinTeam(team.id)}
                  disabled={joinedTeams.includes(team.id)}
                  className={`flex items-center space-x-1 py-2 px-3 rounded-lg transition-colors text-sm font-medium ${
                    joinedTeams.includes(team.id)
                      ? 'bg-gray-600 text-white cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  <UserPlus size={16} />
                  <span>{joinedTeams.includes(team.id) ? 'Joined' : 'Join'}</span>
                </button>
              )}
            </div>

            {/* Member Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>Members</span>
                <span>{team.members.length}/{team.maxMembers}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(team.members.length / team.maxMembers) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTeams.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No teams found</h3>
          <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      <TeamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        team={selectedTeam}
        onSave={handleSaveTeam}
      />
    </div>
  );
}