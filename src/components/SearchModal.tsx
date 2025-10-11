import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, FolderOpen, MessageSquare, Users, BookOpen, User, X, Clock, Tag, Search } from 'lucide-react';
import { useSearch, SearchResult } from '../contexts/SearchContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery, searchResults, isSearching, performSearch, clearSearch } = useSearch();
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [localQuery, setLocalQuery] = useState('');

  // Sync local query with global search query
  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setLocalQuery(query);
    setSearchQuery(query);
    
    if (query.trim()) {
      performSearch(query);
    } else {
      clearSearch();
    }
  };

  // Handle search input key events
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && localQuery.trim()) {
      e.preventDefault();
      performSearch(localQuery);
    }
  };

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'event':
        return <Calendar size={16} className="text-blue-500" />;
      case 'project':
        return <FolderOpen size={16} className="text-purple-500" />;
      case 'forum':
        return <MessageSquare size={16} className="text-green-500" />;
      case 'team':
        return <Users size={16} className="text-orange-500" />;
      case 'classgroup':
        return <BookOpen size={16} className="text-indigo-500" />;
      case 'user':
        return <User size={16} className="text-gray-500" />;
      default:
        return <Tag size={16} className="text-gray-500" />;
    }
  };

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'event':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'project':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
      case 'forum':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      case 'team':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400';
      case 'classgroup':
        return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400';
      case 'user':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'event':
        return 'Event';
      case 'project':
        return 'Project';
      case 'forum':
        return 'Forum Post';
      case 'team':
        return 'Team';
      case 'classgroup':
        return 'Class Group';
      case 'user':
        return 'User';
      default:
        return 'Item';
    }
  };

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    onClose();
    clearSearch();
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col border border-gray-200 dark:border-gray-700"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Search
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          
          {/* Search Input */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search events, projects, forums, teams, class groups..."
              value={localQuery}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            {localQuery && (
              <button
                onClick={() => {
                  setLocalQuery('');
                  setSearchQuery('');
                  clearSearch();
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isSearching ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-300">Searching...</span>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {localQuery ? 'No results found' : 'Start typing to search'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {localQuery 
                  ? `No results found for "${localQuery}". Try different keywords.`
                  : 'Search across events, projects, forums, teams, and class groups.'
                }
              </p>
            </div>
          ) : (
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="space-y-3">
                {searchResults.map((result) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                        {getTypeIcon(result.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                            {result.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(result.type)}`}>
                            {getTypeLabel(result.type)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                          {result.description}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                          {result.author && (
                            <div className="flex items-center space-x-1">
                              <User size={12} />
                              <span>{result.author}</span>
                            </div>
                          )}
                          
                          {result.timestamp && (
                            <div className="flex items-center space-x-1">
                              <Clock size={12} />
                              <span>{formatDate(result.timestamp)}</span>
                            </div>
                          )}
                          
                          {result.category && (
                            <div className="flex items-center space-x-1">
                              <Tag size={12} />
                              <span>{result.category}</span>
                            </div>
                          )}
                        </div>
                        
                        {result.tags && result.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {result.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                            {result.tags.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                                +{result.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Press <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Esc</kbd> to close
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
