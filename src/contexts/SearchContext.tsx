import React, { createContext, useContext, useState, useCallback } from 'react';

export interface SearchResult {
  id: string;
  type: 'event' | 'project' | 'forum' | 'team' | 'user' | 'classgroup';
  title: string;
  description: string;
  url: string;
  category?: string;
  author?: string;
  timestamp?: string;
  tags?: string[];
}

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: SearchResult[];
  setSearchResults: (results: SearchResult[]) => void;
  isSearching: boolean;
  setIsSearching: (searching: boolean) => void;
  performSearch: (query: string) => Promise<void>;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

interface SearchProviderProps {
  children: React.ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchQuery(query);

    try {
      const token = localStorage.getItem('collegeconnect_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      // Perform parallel searches across different data types
      const searchPromises = [
        // Search events
        fetch(`${API_BASE_URL}/events/search?q=${encodeURIComponent(query)}`, { headers })
          .then(res => res.ok ? res.json() : { data: [] })
          .then(data => (data.data || []).map((event: any) => ({
            id: event._id || event.id,
            type: 'event' as const,
            title: event.title,
            description: event.description,
            url: `/events/${event._id || event.id}`,
            category: event.category,
            author: event.organizerName,
            timestamp: event.date,
            tags: event.tags || []
          }))),

        // Search projects
        fetch(`${API_BASE_URL}/projects/search?q=${encodeURIComponent(query)}`, { headers })
          .then(res => res.ok ? res.json() : { data: [] })
          .then(data => (data.data || []).map((project: any) => ({
            id: project._id || project.id,
            type: 'project' as const,
            title: project.title,
            description: project.description,
            url: `/projects/${project._id || project.id}`,
            category: project.category,
            author: project.ownerName,
            timestamp: project.createdAt,
            tags: project.technologies || []
          }))),

        // Search forum posts
        fetch(`${API_BASE_URL}/forums/search?q=${encodeURIComponent(query)}`, { headers })
          .then(res => res.ok ? res.json() : { data: [] })
          .then(data => (data.data || []).map((post: any) => ({
            id: post._id || post.id,
            type: 'forum' as const,
            title: post.title,
            description: post.content,
            url: `/forums/${post._id || post.id}`,
            category: post.category,
            author: post.authorName,
            timestamp: post.createdAt,
            tags: post.tags || []
          }))),

        // Search teams
        fetch(`${API_BASE_URL}/teams/search?q=${encodeURIComponent(query)}`, { headers })
          .then(res => res.ok ? res.json() : { data: [] })
          .then(data => (data.data || []).map((team: any) => ({
            id: team._id || team.id,
            type: 'team' as const,
            title: team.name,
            description: team.description,
            url: `/teams/${team._id || team.id}`,
            category: team.category,
            author: team.leaderName,
            timestamp: team.createdAt,
            tags: team.skills || []
          }))),

        // Search class groups
        fetch(`${API_BASE_URL}/class-groups/search?q=${encodeURIComponent(query)}`, { headers })
          .then(res => res.ok ? res.json() : { data: [] })
          .then(data => (data.data || []).map((classGroup: any) => ({
            id: classGroup._id || classGroup.id,
            type: 'classgroup' as const,
            title: classGroup.name,
            description: classGroup.description,
            url: `/class-groups/${classGroup._id || classGroup.id}`,
            category: classGroup.subject,
            author: classGroup.teacherName,
            timestamp: classGroup.createdAt,
            tags: [classGroup.courseCode, classGroup.semester]
          })))
      ];

      const results = await Promise.all(searchPromises);
      const allResults = results.flat().filter(Boolean);
      
      // Sort results by relevance (exact title matches first, then partial matches)
      const sortedResults = allResults.sort((a, b) => {
        const aTitleMatch = a.title.toLowerCase().includes(query.toLowerCase());
        const bTitleMatch = b.title.toLowerCase().includes(query.toLowerCase());
        
        if (aTitleMatch && !bTitleMatch) return -1;
        if (!aTitleMatch && bTitleMatch) return 1;
        
        return 0;
      });

      setSearchResults(sortedResults);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [API_BASE_URL]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  }, []);

  const value: SearchContextType = {
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    isSearching,
    setIsSearching,
    performSearch,
    clearSearch
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};
