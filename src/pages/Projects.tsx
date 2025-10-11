import React, { useState } from 'react';
import { FolderOpen, Github, ExternalLink, Plus, Search, Filter, Users, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ProjectModal from '../components/Modals/ProjectModal';
import { Project } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | undefined>();
  const [isViewMode, setIsViewMode] = useState(false);

  React.useEffect(() => {
    fetchProjects();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('collegeconnect_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/projects`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.status}`);
      }
      
      const data = await response.json();
      const normalizedProjects = (data.projects || []).map((project: any) => ({
        ...project,
        id: project._id ? (typeof project._id === 'string' ? project._id : project._id.toString()) : 
            (project.id ? (typeof project.id === 'string' ? project.id : project.id.toString()) : 
            String(Date.now() + Math.random()))
      }));
      setProjects(normalizedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError(error instanceof Error ? error.message : 'Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || project.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreateProject = () => {
    setSelectedProject(undefined);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleViewProjectDetails = (project: Project) => {
    setSelectedProject(project);
    setIsViewMode(true);
    setIsModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleSaveProject = async (projectData: Partial<Project>) => {
    try {
      setError(null);
      if (selectedProject) {
        const response = await fetch(`${API_BASE_URL}/projects/${selectedProject.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(projectData)
        });
        if (!response.ok) {
          throw new Error('Failed to update project');
        }
        await fetchProjects();
      } else {
        const payload = {
          title: projectData.title,
          description: projectData.description,
          technologies: projectData.technologies || [],
          category: projectData.category,
          status: projectData.status,
          githubUrl: projectData.githubUrl,
          liveUrl: projectData.liveUrl,
          image: (projectData as any)?.image
        };
        const response = await fetch(`${API_BASE_URL}/projects`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          throw new Error('Failed to create project');
        }
        await fetchProjects();
      }
    } catch (error) {
      console.error('Error saving project:', error);
      setError(error instanceof Error ? error.message : 'Failed to save project. Please try again.');
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'web': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'mobile': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'ai': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'data': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'planning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Showcase and collaborate on amazing projects</p>
        </div>
        <button 
          onClick={handleCreateProject}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={18} />
          <span>New Project</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="pl-10 pr-8 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[140px]"
              >
                <option value="all">All Categories</option>
                <option value="web">Web</option>
                <option value="mobile">Mobile</option>
                <option value="ai">AI</option>
                <option value="data">Data</option>
                <option value="other">Other</option>
              </select>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[120px]"
            >
              <option value="all">All Status</option>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
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
          {/* Projects Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
            {project.image && (
              <div className="h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(project.category)}`}>
                    {project.category}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Users size={16} className="mr-1" />
                  {project.members.length}
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {project.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                {project.description}
              </p>

              <div className="mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Technologies:</p>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-md">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <span>By {project.ownerName}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Calendar size={16} className="mr-1" />
                  {new Date(project.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                  >
                    <Github size={16} />
                    <span className="text-sm">Code</span>
                  </a>
                )}
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    <ExternalLink size={16} />
                    <span className="text-sm">Live Demo</span>
                  </a>
                )}
                <div className="flex space-x-2 flex-1">
                  <button 
                    onClick={() => handleViewProjectDetails(project)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                  >
                    View Details
                  </button>
                  {project.owner === user?.id && (
                    <button
                      onClick={() => handleEditProject(project)}
                      className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No projects found</h3>
              <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </>
      )}

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        project={selectedProject}
        onSave={handleSaveProject}
        viewOnly={isViewMode}
      />
    </div>
  );
}