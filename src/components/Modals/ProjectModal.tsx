import React, { useState, useEffect } from 'react';
import { X, Plus, Github, Tag, Calendar, User, Code, Globe } from 'lucide-react';
import { Project } from '../../types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project;
  onSave: (projectData: Partial<Project>) => void;
  viewOnly?: boolean;
}

export default function ProjectModal({ isOpen, onClose, project, onSave, viewOnly = false }: ProjectModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technologies: [] as string[],
    category: 'web' as 'web' | 'mobile' | 'ai' | 'data' | 'other',
    status: 'planning' as 'planning' | 'active' | 'completed',
    githubUrl: '',
    liveUrl: '',
    image: ''
  });

  const [newTech, setNewTech] = useState('');

  // Update form data when project prop changes
  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        technologies: project.technologies || [],
        category: project.category || 'web',
        status: project.status || 'planning',
        githubUrl: project.githubUrl || '',
        liveUrl: project.liveUrl || '',
        image: project.image || ''
      });
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      category: formData.category as 'web' | 'mobile' | 'ai' | 'data' | 'other',
      status: formData.status as 'planning' | 'active' | 'completed'
    });
    onClose();
  };

  const addTechnology = () => {
    if (newTech.trim() && !formData.technologies.includes(newTech.trim())) {
      setFormData({
        ...formData,
        technologies: [...formData.technologies, newTech.trim()]
      });
      setNewTech('');
    }
  };

  const removeTechnology = (tech: string) => {
    setFormData({
      ...formData,
      technologies: formData.technologies.filter(t => t !== tech)
    });
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
      case 'planning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-900 shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {viewOnly ? 'Project Details' : project ? 'Edit Project' : 'Create New Project'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X size={20} />
            </button>
          </div>

          {viewOnly ? (
            // View Mode - Display project details
            <div className="space-y-6">
              {/* Project Image */}
              {project?.image && (
                <div className="w-full h-48 rounded-lg overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Project Title and Badges */}
              <div className="flex items-start justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{project?.title}</h2>
                <div className="flex space-x-2">
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(project?.category || '')}`}>
                    <Tag size={14} className="mr-1" />
                    {project?.category}
                  </span>
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(project?.status || '')}`}>
                    <Code size={14} className="mr-1" />
                    {project?.status}
                  </span>
                </div>
              </div>

              {/* Project Description */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</h4>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{project?.description}</p>
              </div>

              {/* Technologies */}
              {project?.technologies && project.technologies.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Technologies Used</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-sm rounded-full">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Project Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project?.githubUrl && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Github className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">GitHub Repository</p>
                      <a 
                        href={project.githubUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                      >
                        View on GitHub
                      </a>
                    </div>
                  </div>
                )}

                {project?.liveUrl && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Live Demo</p>
                      <a 
                        href={project.liveUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                      >
                        Visit Live Site
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Project Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <User className="w-5 h-5 text-indigo-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Owner</p>
                    <p className="text-gray-600 dark:text-gray-400">{project?.ownerName || 'Unknown'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Calendar className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Created</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {project?.createdAt ? new Date(project.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            // Edit/Create Mode - Form
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="web">Web</option>
                    <option value="mobile">Mobile</option>
                    <option value="ai">AI</option>
                    <option value="data">Data</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Technologies
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Add technology..."
                  />
                  <button
                    type="button"
                    onClick={addTechnology}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-sm rounded-md"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTechnology(tech)}
                        className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  GitHub URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="https://github.com/username/repo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Live URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.liveUrl}
                  onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="https://myproject.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Image URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {project ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}