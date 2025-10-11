import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ClassGroup } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ClassGroupDetailPageProps {}

const ClassGroupDetailPage: React.FC<ClassGroupDetailPageProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [classGroup, setClassGroup] = useState<ClassGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'doubts' | 'assignments'>('overview');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showDoubtForm, setShowDoubtForm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [selectedDoubt, setSelectedDoubt] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submittingDoubt, setSubmittingDoubt] = useState(false);
  const [creatingAssignment, setCreatingAssignment] = useState(false);
  const [answeringDoubt, setAnsweringDoubt] = useState(false);
  const [notifications, setNotifications] = useState<Array<{id: string, message: string, type: 'success' | 'info' | 'warning' | 'error'}>>([]);
  
  // File upload form
  const [fileForm, setFileForm] = useState({
    file: null as File | null,
    description: '',
    category: 'resource' as 'lecture' | 'assignment' | 'resource' | 'announcement'
  });
  
  // Doubt form
  const [doubtForm, setDoubtForm] = useState({
    question: '',
    description: '',
    studentId: ''
  });

  // Assignment form
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxPoints: 100
  });

  // Answer form
  const [answerForm, setAnswerForm] = useState({
    answer: ''
  });

  const addNotification = (message: string, type: 'success' | 'info' | 'warning' | 'error') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    if (id) {
      fetchClassGroup();
    }
  }, [id]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('collegeconnect_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  const fetchClassGroup = async () => {
    if (!id) {
      console.error('No class group ID provided');
      navigate('/class-groups');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/class-groups/${id}`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        const classGroupData = {
          ...data.data,
          id: data.data._id || data.data.id
        };
        setClassGroup(classGroupData);
      } else {
        alert('Failed to fetch class group details');
        navigate('/class-groups');
      }
    } catch (error) {
      console.error('Error fetching class group:', error);
      alert('Error fetching class group details');
      navigate('/class-groups');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileForm.file || uploading) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', fileForm.file);
      formData.append('description', fileForm.description);
      formData.append('category', fileForm.category);

      const token = localStorage.getItem('collegeconnect_token');
      const response = await fetch(`${API_BASE_URL}/class-groups/${id}/files`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        const newFile = {
          ...data.data,
          id: data.data._id || data.data.id
        };
        setClassGroup(prev => prev ? {
          ...prev,
          files: [...prev.files, newFile],
          statistics: {
            ...prev.statistics,
            totalFiles: prev.statistics.totalFiles + 1
          }
        } : null);
        setShowFileUpload(false);
        setFileForm({ file: null, description: '', category: 'resource' });
        alert('File uploaded successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDoubtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtForm.question.trim() || submittingDoubt) return;

    setSubmittingDoubt(true);
    try {
      const response = await fetch(`${API_BASE_URL}/class-groups/${id}/doubts`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(doubtForm)
      });

      if (response.ok) {
        const data = await response.json();
        setClassGroup(prev => prev ? {
          ...prev,
          doubts: [...prev.doubts, data.data],
          statistics: {
            ...prev.statistics,
            totalDoubts: prev.statistics.totalDoubts + 1,
            pendingDoubts: prev.statistics.pendingDoubts + 1
          }
        } : null);
        setShowDoubtForm(false);
        setDoubtForm({ question: '', description: '', studentId: '' });
        alert('Doubt submitted successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to submit doubt');
      }
    } catch (error) {
      console.error('Error submitting doubt:', error);
      alert('Failed to submit doubt');
    } finally {
      setSubmittingDoubt(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creatingAssignment) return;

    // Validate form
    if (!assignmentForm.title.trim() || !assignmentForm.description.trim() || !assignmentForm.dueDate) {
      alert('Please fill in all required fields');
      return;
    }

    setCreatingAssignment(true);
    try {
      const response = await fetch(`${API_BASE_URL}/class-groups/${id}/assignments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...assignmentForm,
          dueDate: new Date(assignmentForm.dueDate).toISOString()
        })
      });

      if (response.ok) {
        const data = await response.json();
        setClassGroup(prev => prev ? {
          ...prev,
          assignments: [...prev.assignments, data.data],
          statistics: {
            ...prev.statistics,
            totalAssignments: prev.statistics.totalAssignments + 1
          }
        } : null);
        setShowAssignmentForm(false);
        setAssignmentForm({
          title: '',
          description: '',
          dueDate: '',
          maxPoints: 100
        });
        addNotification('Assignment created successfully!', 'success');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create assignment');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert('Failed to create assignment: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setCreatingAssignment(false);
    }
  };

  const handleAnswerDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoubt || !answerForm.answer.trim() || answeringDoubt) return;

    setAnsweringDoubt(true);
    try {
      const response = await fetch(`${API_BASE_URL}/class-groups/${id}/doubts/${selectedDoubt}/answer`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ answer: answerForm.answer })
      });

      if (response.ok) {
        setClassGroup(prev => prev ? {
          ...prev,
          doubts: prev.doubts.map(doubt => 
            doubt.id === selectedDoubt 
              ? { 
                  ...doubt, 
                  answer: { 
                    text: answerForm.answer, 
                    answeredBy: user?.id || '', 
                    answeredByName: user?.name || '', 
                    answeredAt: new Date().toISOString() 
                  }, 
                  status: 'answered' 
                }
              : doubt
          ),
          statistics: {
            ...prev.statistics,
            pendingDoubts: Math.max(0, prev.statistics.pendingDoubts - 1)
          }
        } : null);
        setShowAnswerForm(false);
        setSelectedDoubt(null);
        setAnswerForm({ answer: '' });
        addNotification('Doubt answered successfully!', 'success');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to answer doubt');
      }
    } catch (error) {
      console.error('Error answering doubt:', error);
      alert('Failed to answer doubt: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setAnsweringDoubt(false);
    }
  };

  const handleDownloadFile = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = `${API_BASE_URL.replace('/api', '')}${fileUrl}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'answered': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'resolved': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!classGroup) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Class Group Not Found</h3>
        <button
          onClick={() => navigate('/class-groups')}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Back to Class Groups
        </button>
      </div>
    );
  }

  // Handle both object and string formats for teacher
  const teacherId = typeof classGroup.teacher === 'object' ? classGroup.teacher?._id : classGroup.teacher;
  const isTeacher = teacherId === user?.id;
  
  // Handle both object and string formats for students
  const isStudent = classGroup.students.some(student => {
    const studentUserId = typeof student.user === 'object' ? student.user?._id : student.user;
    return studentUserId === user?.id && student.isActive;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg shadow-lg max-w-sm border ${
              notification.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200' :
              notification.type === 'info' ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200' :
              notification.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200' :
              'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200'
            }`}
          >
            <div className="flex justify-between items-start">
              <p className="text-sm">{notification.message}</p>
              <button
                onClick={() => removeNotification(notification.id)}
                className="ml-2 text-lg leading-none hover:opacity-70"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-start">
            <div>
              <button
                onClick={() => navigate('/class-groups')}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-4 flex items-center"
              >
                ← Back to Class Groups
              </button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {classGroup.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                {classGroup.subject} - {classGroup.courseCode} | {classGroup.semester} Semester
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Academic Year: {classGroup.academicYear}
                {isTeacher && (
                  <span className="ml-2">
                    | Join Key: <span className="font-mono bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-2 py-1 rounded">{classGroup.joinKey}</span>
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex space-x-3">
              {isTeacher && (
                <>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    📤 Share Class
                  </button>
                  <button
                    onClick={() => setShowFileUpload(true)}
                    className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Upload File
                  </button>
                  <button
                    onClick={() => setShowAssignmentForm(true)}
                    className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Create Assignment
                  </button>
                </>
              )}
              
              {isStudent && (
                <button
                  onClick={() => setShowDoubtForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Ask Doubt
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'files', label: 'Files', icon: '📁' },
                { id: 'doubts', label: 'Doubts', icon: '❓' },
                { id: 'assignments', label: 'Assignments', icon: '📝' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {activeTab === 'overview' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{classGroup.statistics.activeStudents}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Active Students</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{classGroup.statistics.totalFiles}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Files Uploaded</div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{classGroup.statistics.pendingDoubts}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Pending Doubts</div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Description</h3>
                <p className="text-gray-600 dark:text-gray-300">{classGroup.description}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Students</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classGroup.students.map((student) => (
                    <div key={student.user} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="font-medium text-gray-900 dark:text-white">{student.userName}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">ID: {student.studentId}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Joined: {new Date(student.joinedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'files' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Files & Resources</h3>
                {isTeacher && (
                  <button
                    onClick={() => setShowFileUpload(true)}
                    className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Upload File
                  </button>
                )}
              </div>

              {classGroup.files.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📁</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Files Yet</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {isTeacher ? 'Upload your first file to get started' : 'No files have been uploaded yet'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classGroup.files.map((file) => (
                    <div key={file.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-gray-900 dark:text-white truncate">{file.originalName}</div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          file.category === 'lecture' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                          file.category === 'assignment' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                          file.category === 'announcement' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                          'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}>
                          {file.category}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {formatFileSize(file.fileSize)} • {file.fileType}
                      </div>
                      {file.description && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">{file.description}</div>
                      )}
                      <div className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                        Uploaded by {file.uploadedByName} on {new Date(file.uploadedAt).toLocaleDateString()}
                      </div>
                      <button
                        onClick={() => handleDownloadFile(file.fileUrl, file.originalName)}
                        className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-3 py-2 rounded text-sm transition-colors"
                      >
                        📥 Download
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'doubts' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Doubts & Questions</h3>
                {isStudent && (
                  <button
                    onClick={() => setShowDoubtForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Ask Doubt
                  </button>
                )}
              </div>

              {classGroup.doubts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">❓</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Doubts Yet</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {isStudent ? 'Ask your first question to get help' : 'No questions have been asked yet'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {classGroup.doubts.map((doubt) => (
                    <div key={doubt.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{doubt.question}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            Asked by {doubt.studentName} ({doubt.studentId})
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doubt.status)}`}>
                          {doubt.status}
                        </span>
                      </div>
                      
                      {doubt.description && (
                        <div className="text-gray-600 dark:text-gray-300 mb-3">{doubt.description}</div>
                      )}
                      
                      {doubt.answer && (
                        <div className="bg-green-50 dark:bg-green-900/30 border-l-4 border-green-400 dark:border-green-500 p-4 mb-3">
                          <div className="font-medium text-green-800 dark:text-green-200 mb-2">Answer:</div>
                          <div className="text-green-700 dark:text-green-300">{doubt.answer.text}</div>
                          <div className="text-sm text-green-600 dark:text-green-400 mt-2">
                            Answered by {doubt.answer.answeredByName} on {new Date(doubt.answer.answeredAt).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center mt-3">
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          Asked on {new Date(doubt.createdAt).toLocaleDateString()}
                        </div>
                        {isTeacher && doubt.status === 'pending' && (
                          <button
                            onClick={() => {
                              setSelectedDoubt(doubt.id);
                              setShowAnswerForm(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            Answer
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Assignments</h3>
                {isTeacher && (
                  <button 
                    onClick={() => setShowAssignmentForm(true)}
                    className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Create Assignment
                  </button>
                )}
              </div>

              {classGroup.assignments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Assignments Yet</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {isTeacher ? 'Create your first assignment' : 'No assignments have been posted yet'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {classGroup.assignments.map((assignment) => (
                    <div key={assignment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{assignment.title}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900 dark:text-white">{assignment.maxPoints} points</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {assignment.submissions.length} submissions
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-gray-600 dark:text-gray-300 mb-3">{assignment.description}</div>
                      
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        Created by {assignment.createdByName} on {new Date(assignment.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* File Upload Modal */}
      {showFileUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upload File</h3>
            
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select File
                </label>
                <input
                  type="file"
                  onChange={(e) => setFileForm(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={fileForm.category}
                  onChange={(e) => setFileForm(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="resource">Resource</option>
                  <option value="lecture">Lecture</option>
                  <option value="assignment">Assignment</option>
                  <option value="announcement">Announcement</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={fileForm.description}
                  onChange={(e) => setFileForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowFileUpload(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors bg-white dark:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!fileForm.file || uploading}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? 'Uploading...' : 'Upload File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Doubt Form Modal */}
      {showDoubtForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ask a Doubt</h3>
            
            <form onSubmit={handleDoubtSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Student ID
                </label>
                <input
                  type="text"
                  value={doubtForm.studentId}
                  onChange={(e) => setDoubtForm(prev => ({ ...prev, studentId: e.target.value }))}
                  placeholder="Enter your student ID"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Question *
                </label>
                <input
                  type="text"
                  value={doubtForm.question}
                  onChange={(e) => setDoubtForm(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="What's your question?"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={doubtForm.description}
                  onChange={(e) => setDoubtForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Provide more details..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDoubtForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors bg-white dark:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!doubtForm.question.trim() || submittingDoubt}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submittingDoubt ? 'Submitting...' : 'Submit Doubt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {showAssignmentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create Assignment</h3>
            
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter assignment title"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={assignmentForm.description}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the assignment requirements..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Due Date *
                  </label>
                  <input
                    type="datetime-local"
                    value={assignmentForm.dueDate}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Points
                  </label>
                  <input
                    type="number"
                    value={assignmentForm.maxPoints}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, maxPoints: parseInt(e.target.value) || 100 }))}
                    min="1"
                    max="1000"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAssignmentForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors bg-white dark:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingAssignment}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {creatingAssignment ? 'Creating...' : 'Create Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Answer Doubt Modal */}
      {showAnswerForm && selectedDoubt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Answer Doubt</h3>
            
            <form onSubmit={handleAnswerDoubt} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Answer *
                </label>
                <textarea
                  value={answerForm.answer}
                  onChange={(e) => setAnswerForm(prev => ({ ...prev, answer: e.target.value }))}
                  placeholder="Provide a detailed answer..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAnswerForm(false);
                    setSelectedDoubt(null);
                    setAnswerForm({ answer: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors bg-white dark:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!answerForm.answer.trim() || answeringDoubt}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {answeringDoubt ? 'Answering...' : 'Submit Answer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Class Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Share Class</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Class Name
                </label>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md text-gray-900 dark:text-white">
                  {classGroup?.name}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Join Key
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md font-mono text-lg text-center text-gray-900 dark:text-white">
                    {classGroup?.joinKey}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(classGroup?.joinKey || '');
                      alert('Join key copied to clipboard!');
                    }}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-md transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-md p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">How to share:</h4>
                <ol className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                  <li>1. Share the join key with your students</li>
                  <li>2. Students can join using the "Join Class" button</li>
                  <li>3. They'll need to enter this join key</li>
                </ol>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 text-white rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassGroupDetailPage;
