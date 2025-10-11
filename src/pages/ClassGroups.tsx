import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ClassGroup } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ClassGroupsPageProps {}

const ClassGroupsPage: React.FC<ClassGroupsPageProps> = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [joinKey, setJoinKey] = useState('');
  const [studentId, setStudentId] = useState('');
  const [joining, setJoining] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Create class group form data
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    subject: '',
    courseCode: '',
    semester: '1st',
    academicYear: '',
    maxStudents: 50
  });

  useEffect(() => {
    fetchClassGroups();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('collegeconnect_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  const fetchClassGroups = async () => {
    try {
      const endpoint = user?.role === 'faculty' ? 'teacher' : 'student';
      
      const response = await fetch(`${API_BASE_URL}/class-groups/${endpoint}`, {
        headers: getAuthHeaders()
      });
      
      
      if (response.ok) {
        const data = await response.json();
        // Convert _id to id for consistency
        const classGroups = (data.data.classGroups || []).map((group: any) => ({
          ...group,
          id: group._id || group.id
        }));
        setClassGroups(classGroups);
      } else {
        const error = await response.json();
        console.error('Failed to fetch class groups:', error);
        alert('Failed to fetch class groups: ' + (error.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error fetching class groups:', error);
      alert('Error fetching class groups: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinKey.trim() || !studentId.trim() || joining) return;

    setJoining(true);
    try {
      const response = await fetch(`${API_BASE_URL}/class-groups/join`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ joinKey, studentId })
      });

      if (response.ok) {
        const data = await response.json();
        const newClassGroup = {
          ...data.data,
          id: data.data._id || data.data.id
        };
        setClassGroups(prev => [newClassGroup, ...prev]);
        setShowJoinModal(false);
        setJoinKey('');
        setStudentId('');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to join class group');
      }
    } catch (error) {
      console.error('Error joining class group:', error);
      alert('Failed to join class group');
    } finally {
      setJoining(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creating) return;

    // Validate form
    if (!createForm.name.trim() || !createForm.description.trim() || 
        !createForm.subject.trim() || !createForm.courseCode.trim() || 
        !createForm.academicYear.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setCreating(true);
    try {
      
      const response = await fetch(`${API_BASE_URL}/class-groups`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(createForm)
      });

      
      if (response.ok) {
        const data = await response.json();
        const newClassGroup = {
          ...data.data,
          id: data.data._id || data.data.id
        };
        setClassGroups(prev => [newClassGroup, ...prev]);
        setShowCreateModal(false);
        setCreateForm({
          name: '',
          description: '',
          subject: '',
          courseCode: '',
          semester: '1st',
          academicYear: '',
          maxStudents: 50
        });
        alert('Class group created successfully!');
      } else {
        const error = await response.json();
        console.error('Error response:', error);
        alert(error.message || 'Failed to create class group');
      }
    } catch (error) {
      console.error('Error creating class group:', error);
      alert('Failed to create class group: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setCreating(false);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30' 
      : 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                📚 Class Groups
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                {user?.role === 'faculty' 
                  ? 'Manage your class groups and assignments'
                  : 'Join class groups and access assignments'
                }
              </p>
            </div>
            
            <div className="flex space-x-3">
              {user?.role === 'faculty' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Create Class Group
                </button>
              )}
              
              {user?.role === 'student' && (
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Join Class
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Class Groups Grid */}
        {classGroups.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {user?.role === 'faculty' ? 'No Class Groups Yet' : 'No Classes Joined'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {user?.role === 'faculty' 
                ? 'Create your first class group to get started'
                : 'Join a class group using a join key from your teacher'
              }
            </p>
            {user?.role === 'faculty' && (
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Create Class Group
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classGroups.map((classGroup) => (
              <div
                key={classGroup.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
                        {classGroup.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {classGroup.subject} - {classGroup.courseCode}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(classGroup.isActive)}`}>
                      {classGroup.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                    {classGroup.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Semester:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{classGroup.semester}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Academic Year:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{classGroup.academicYear}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Students:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {classGroup.statistics.activeStudents}/{classGroup.maxStudents}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Assignments:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{classGroup.statistics.totalAssignments}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Teacher: {classGroup.teacherName}
                    </div>
                    <button 
                      onClick={() => navigate(`/class-groups/${classGroup.id}`)}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Join Class Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Join Class Group
            </h3>
            
            <form onSubmit={handleJoinClass}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Join Key
                </label>
                <input
                  type="text"
                  value={joinKey}
                  onChange={(e) => setJoinKey(e.target.value.toUpperCase())}
                  placeholder="Enter 8-character join key"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  maxLength={8}
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Student ID
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Enter your student ID"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors bg-white dark:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!joinKey.trim() || !studentId.trim() || joining}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {joining ? 'Joining...' : 'Join Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

        {/* Create Class Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create New Class Group
            </h3>
            
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Class Name *
                  </label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Data Structures & Algorithms"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={createForm.subject}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="e.g., Computer Science"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this class is about..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    value={createForm.courseCode}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, courseCode: e.target.value.toUpperCase() }))}
                    placeholder="e.g., CS301"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Semester *
                  </label>
                  <select
                    value={createForm.semester}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, semester: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="1st">1st Semester</option>
                    <option value="2nd">2nd Semester</option>
                    <option value="3rd">3rd Semester</option>
                    <option value="4th">4th Semester</option>
                    <option value="5th">5th Semester</option>
                    <option value="6th">6th Semester</option>
                    <option value="7th">7th Semester</option>
                    <option value="8th">8th Semester</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Academic Year *
                  </label>
                  <input
                    type="text"
                    value={createForm.academicYear}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, academicYear: e.target.value }))}
                    placeholder="e.g., 2024-2025"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maximum Students
                </label>
                <input
                  type="number"
                  value={createForm.maxStudents}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, maxStudents: parseInt(e.target.value) || 50 }))}
                  min="1"
                  max="200"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors bg-white dark:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {creating ? 'Creating...' : 'Create Class Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassGroupsPage;
