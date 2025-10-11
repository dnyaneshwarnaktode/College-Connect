import React, { useState } from 'react';
import { Users, Crown, Plus, Search, Filter, Calendar, UserPlus, Eye, X, UserMinus, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import TeamModal from '../components/Modals/TeamModal';
import TeamChatModal from '../components/Modals/TeamChatModal';
import { Team } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Teams() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | undefined>();
  const [joinedTeams, setJoinedTeams] = useState<string[]>([]);
  const [viewingTeam, setViewingTeam] = useState<Team | null>(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [chatTeam, setChatTeam] = useState<Team | null>(null);

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
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/teams`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch teams: ${response.status}`);
      }
      
      const data = await response.json();
      const apiTeams = Array.isArray(data?.teams) ? data.teams : [];
      const normalizedTeams: Team[] = apiTeams.map((t: any) => {
        const leaderObj = t.leader && typeof t.leader === 'object' ? t.leader : undefined;
        const membersArray = Array.isArray(t.members) ? t.members : [];
        
        // Convert _id to string properly
        const teamId = t._id ? (typeof t._id === 'string' ? t._id : t._id.toString()) : 
                       (t.id ? (typeof t.id === 'string' ? t.id : t.id.toString()) : 
                       String(Date.now() + Math.random()));
        
        // Extract active member IDs from the members array
        const activeMemberIds = membersArray
          .filter((m: any) => m.isActive !== false) // Only active members
          .map((m: any) => {
            if (typeof m === 'string') return m;
            if (m?.user?._id) return m.user._id.toString();
            if (m?.user?.id) return m.user.id.toString();
            if (m?.user) return m.user.toString();
            return '';
          })
          .filter(Boolean);
        
        return {
          id: teamId,
          name: t.name || '',
          description: t.description || '',
          type: t.type || 'project',
          leader: typeof t.leader === 'string' ? t.leader : leaderObj?._id || leaderObj?.id || '',
          leaderName: leaderObj?.name || t.leaderName || 'Unknown',
          members: activeMemberIds,
          maxMembers: typeof t.maxMembers === 'number' ? t.maxMembers : 100, // Increased default limit
          isOpen: typeof t.isOpen === 'boolean' ? t.isOpen : true,
          tags: Array.isArray(t.tags) ? t.tags : [],
          createdAt: t.createdAt || new Date().toISOString()
        } as Team;
      });
      setTeams(normalizedTeams);
      
      // Update joined teams based on actual membership
      const userJoinedTeams = normalizedTeams
        .filter(team => team.members.includes(user?.id || ''))
        .map(team => team.id);
      setJoinedTeams(userJoinedTeams);
    } catch (error) {
      console.error('Error fetching teams:', error);
      setError(error instanceof Error ? error.message : 'Failed to load teams. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || team.type === filterType;
    return matchesSearch && matchesType;
  });

  const joinedTeamsList = filteredTeams.filter(team => joinedTeams.includes(team.id));
  const availableTeamsList = filteredTeams.filter(team => !joinedTeams.includes(team.id));

  const handleCreateTeam = () => {
    setSelectedTeam(undefined);
    setIsModalOpen(true);
  };

  const handleEditTeam = (team: Team) => {
    setSelectedTeam(team);
    setIsModalOpen(true);
  };

  const handleSaveTeam = async (teamData: Partial<Team>) => {
    try {
      setError(null);
      if (selectedTeam) {
        const response = await fetch(`${API_BASE_URL}/teams/${selectedTeam.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(teamData)
        });
        if (!response.ok) {
          throw new Error('Failed to update team');
        }
        await fetchTeams();
      } else {
        const payload = {
          name: teamData.name,
          description: teamData.description,
          type: teamData.type,
          maxMembers: teamData.maxMembers,
          isOpen: teamData.isOpen,
          tags: (teamData as any)?.tags || []
        };
        const response = await fetch(`${API_BASE_URL}/teams`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          throw new Error('Failed to create team');
        }
        await fetchTeams();
      }
    } catch (error) {
      console.error('Error saving team:', error);
      setError(error instanceof Error ? error.message : 'Failed to save team. Please try again.');
    }
  };

  const handleJoinTeam = async (teamId: string) => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/teams/${teamId}/join`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to join team');
      }
      
      await response.json();
      
      // Add to joined teams list
      setJoinedTeams(prev => [...prev, teamId]);
      
      // Refresh teams to get updated member count
      await fetchTeams();
      
    } catch (error) {
      console.error('Error joining team:', error);
      setError(error instanceof Error ? error.message : 'Failed to join team. Please try again.');
    }
  };

  const handleViewTeamDetails = (team: Team) => {
    setViewingTeam(team);
  };

  const handleCloseTeamDetails = () => {
    setViewingTeam(null);
  };

  const handleLeaveTeam = async (teamId: string) => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/teams/${teamId}/leave`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to leave team');
      }
      
      // Remove from joined teams list
      setJoinedTeams(prev => prev.filter(id => id !== teamId));
      
      // Refresh teams to get updated member count
      await fetchTeams();
      
    } catch (error) {
      console.error('Error leaving team:', error);
      setError(error instanceof Error ? error.message : 'Failed to leave team. Please try again.');
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

  const handleChatTeam = (team: Team) => {
    setChatTeam(team);
    setIsChatModalOpen(true);
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

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200">
            ✕
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Joined Teams Section */}
          {joinedTeamsList.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <Users className="w-6 h-6 mr-2 text-green-600" />
                My Teams
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {joinedTeamsList.map((team) => (
                  <div key={team.id} className="bg-green-50 dark:bg-green-900/20 rounded-xl shadow-sm border border-green-200 dark:border-green-800 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(team.type)}`}>
                            {team.type}
                          </span>
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Joined
                          </span>
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

                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => handleViewTeamDetails(team)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium flex items-center justify-center space-x-1"
                      >
                        <Eye size={16} />
                        <span>View Details</span>
                      </button>
                      <button 
                        onClick={() => handleChatTeam(team)}
                        className="flex items-center space-x-1 py-2 px-3 rounded-lg transition-colors text-sm font-medium bg-green-600 hover:bg-green-700 text-white"
                      >
                        <MessageCircle size={16} />
                        <span>Chat</span>
                      </button>
                      {team.leader === user?.id && (
                        <button
                          onClick={() => handleEditTeam(team)}
                          className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
                        >
                          Edit
                        </button>
                      )}
                      {team.leader !== user?.id && (
                        <button 
                          onClick={() => handleLeaveTeam(team.id)}
                          className="flex items-center space-x-1 py-2 px-3 rounded-lg transition-colors text-sm font-medium bg-red-600 hover:bg-red-700 text-white"
                        >
                          <UserMinus size={16} />
                          <span>Leave</span>
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
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(team.members.length / team.maxMembers) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Teams Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Users className="w-6 h-6 mr-2 text-blue-600" />
              Available Teams
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableTeamsList.map((team) => (
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
                        {team.tags.slice(0, 3).map((tag, idx) => (
                          <span key={`${team.id}-tag-${idx}-${tag}`} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-md">
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
                      <button 
                        onClick={() => handleViewTeamDetails(team)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium flex items-center justify-center space-x-1"
                      >
                        <Eye size={16} />
                        <span>View Details</span>
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
                    {team.isOpen && (
                      <button 
                        onClick={() => handleJoinTeam(team.id)}
                        className="flex items-center space-x-1 py-2 px-3 rounded-lg transition-colors text-sm font-medium bg-green-600 hover:bg-green-700 text-white"
                      >
                        <UserPlus size={16} />
                        <span>Join</span>
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
          </div>

          {filteredTeams.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No teams found</h3>
              <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </>
      )}

      {/* Team Details Modal */}
      {viewingTeam && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleCloseTeamDetails}></div>
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{viewingTeam.name}</h3>
                  <button
                    onClick={handleCloseTeamDetails}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-900 px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Team Info */}
                  <div>
                    <div className="mb-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getTypeColor(viewingTeam.type)}`}>
                          {viewingTeam.type}
                        </span>
                        {viewingTeam.isOpen ? (
                          <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Open
                          </span>
                        ) : (
                          <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                            Closed
                          </span>
                        )}
                      </div>
                      
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Description</h4>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{viewingTeam.description}</p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Crown className="w-5 h-5 text-yellow-500" />
                          <span className="text-gray-700 dark:text-gray-300">
                            <strong>Leader:</strong> {viewingTeam.leaderName}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-5 h-5 text-blue-500" />
                          <span className="text-gray-700 dark:text-gray-300">
                            <strong>Created:</strong> {new Date(viewingTeam.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Users className="w-5 h-5 text-green-500" />
                          <span className="text-gray-700 dark:text-gray-300">
                            <strong>Members:</strong> {viewingTeam.members.length}/{viewingTeam.maxMembers}
                          </span>
                        </div>
                      </div>
                    </div>

                    {viewingTeam.tags.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {viewingTeam.tags.map((tag, idx) => (
                            <span key={`${viewingTeam.id}-tag-${idx}-${tag}`} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-md">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Team Members */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Team Members</h4>
                    <div className="space-y-3">
                      {viewingTeam.members.map((memberId, idx) => (
                        <div key={`${viewingTeam.id}-member-${idx}-${memberId}`} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {memberId === viewingTeam.leader ? 'L' : 'M'}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {memberId === viewingTeam.leader ? `${viewingTeam.leaderName} (Leader)` : `Member ${idx + 1}`}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {memberId === viewingTeam.leader ? 'Team Leader' : 'Team Member'}
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      {viewingTeam.members.length < viewingTeam.maxMembers && (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                          <p className="text-sm">
                            {viewingTeam.maxMembers - viewingTeam.members.length} spots available
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-center space-x-4">
                    {joinedTeams.includes(viewingTeam.id) && viewingTeam.leader !== user?.id && (
                      <button 
                        onClick={() => {
                          handleLeaveTeam(viewingTeam.id);
                          handleCloseTeamDetails();
                        }}
                        className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                      >
                        <UserMinus size={18} />
                        <span>Leave Team</span>
                      </button>
                    )}
                    {!joinedTeams.includes(viewingTeam.id) && viewingTeam.isOpen && (
                      <button 
                        onClick={() => {
                          handleJoinTeam(viewingTeam.id);
                          handleCloseTeamDetails();
                        }}
                        className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                      >
                        <UserPlus size={18} />
                        <span>Join Team</span>
                      </button>
                    )}
                    {viewingTeam.leader === user?.id && (
                      <button
                        onClick={() => {
                          handleEditTeam(viewingTeam);
                          handleCloseTeamDetails();
                        }}
                        className="flex items-center space-x-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
                      >
                        <span>Edit Team</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <TeamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        team={selectedTeam}
        onSave={handleSaveTeam}
      />

      <TeamChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        team={chatTeam!}
      />
    </div>
  );
}