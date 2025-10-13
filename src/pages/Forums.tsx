import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MessageSquare, ThumbsUp, Reply, Plus, Search, Filter, Clock, User } from 'lucide-react';
import ForumPostModal from '../components/Modals/ForumPostModal';
import ReplyModal from '../components/Modals/ReplyModal';
import { ForumPost, Reply as ReplyType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { CardSkeleton } from '../components/Skeleton';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function Forums() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ForumPost | undefined>();
  const [replyingToPost, setReplyingToPost] = useState<ForumPost | undefined>();
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [likedReplies, setLikedReplies] = useState<string[]>([]);

  React.useEffect(() => {
    fetchPosts();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('collegeconnect_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/forums`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch forum posts: ${response.status}`);
      }
      
      const data = await response.json();
      const apiPosts = Array.isArray(data?.posts) ? data.posts : [];
      const normalizedPosts: ForumPost[] = apiPosts.map((p: any) => {
        const authorObj = p.author && typeof p.author === 'object' ? p.author : undefined;
        const repliesArray = Array.isArray(p.replies) ? p.replies : [];
        return {
          id: p._id ? (typeof p._id === 'string' ? p._id : p._id.toString()) : 
              (p.id ? (typeof p.id === 'string' ? p.id : p.id.toString()) : 
              String(Date.now() + Math.random())),
          title: p.title || '',
          content: p.content || '',
          author: typeof p.author === 'string' ? p.author : (authorObj?._id || authorObj?.id || ''),
          authorName: authorObj?.name || p.authorName || 'Unknown',
          category: p.category || 'general',
          replies: repliesArray.map((r: any) => {
            const replyAuthorObj = r.author && typeof r.author === 'object' ? r.author : undefined;
            return {
              id: r._id ? (typeof r._id === 'string' ? r._id : r._id.toString()) : 
                  (r.id ? (typeof r.id === 'string' ? r.id : r.id.toString()) : 
                  String(Date.now() + Math.random())),
              content: r.content || '',
              author: typeof r.author === 'string' ? r.author : (replyAuthorObj?._id || replyAuthorObj?.id || ''),
              authorName: replyAuthorObj?.name || r.authorName || 'Unknown',
              likes: typeof r.likes === 'number' ? r.likes : 0,
              createdAt: r.createdAt || new Date().toISOString()
            } as ReplyType;
          }),
          likes: typeof p.likes === 'number' ? p.likes : 0,
          createdAt: p.createdAt || new Date().toISOString(),
          updatedAt: p.updatedAt || p.createdAt || new Date().toISOString()
        } as ForumPost;
      });
      setPosts(normalizedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError(error instanceof Error ? error.message : 'Failed to load forum posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || post.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreatePost = () => {
    setSelectedPost(undefined);
    setIsPostModalOpen(true);
  };

  const handleEditPost = (post: ForumPost) => {
    setSelectedPost(post);
    setIsPostModalOpen(true);
  };

  const handleSavePost = async (postData: Partial<ForumPost>) => {
    try {
      setError(null);
      
      if (selectedPost) {
        // Edit existing post
        const response = await fetch(`${API_BASE_URL}/forums/${selectedPost.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(postData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update post');
        }
        
        const result = await response.json();
        const updated = result?.post;
        
        if (updated) {
          // Normalize and update posts state
          const authorObj = updated.author && typeof updated.author === 'object' ? updated.author : undefined;
          const repliesArray = Array.isArray(updated.replies) ? updated.replies : [];
          const normalized: ForumPost = {
            id: updated._id ? (typeof updated._id === 'string' ? updated._id : updated._id.toString()) : 
                (updated.id ? (typeof updated.id === 'string' ? updated.id : updated.id.toString()) : 
                selectedPost.id),
            title: updated.title,
            content: updated.content,
            author: typeof updated.author === 'string' ? updated.author : (authorObj?._id || authorObj?.id || ''),
            authorName: authorObj?.name || updated.authorName || 'Unknown',
            category: updated.category,
            replies: repliesArray.map((r: any) => {
              const replyAuthorObj = r.author && typeof r.author === 'object' ? r.author : undefined;
              return {
                id: r._id ? (typeof r._id === 'string' ? r._id : r._id.toString()) : 
                    (r.id ? (typeof r.id === 'string' ? r.id : r.id.toString()) : 
                    String(Date.now() + Math.random())),
                content: r.content,
                author: typeof r.author === 'string' ? r.author : (replyAuthorObj?._id || replyAuthorObj?.id || ''),
                authorName: replyAuthorObj?.name || r.authorName || 'Unknown',
                likes: typeof r.likes === 'number' ? r.likes : 0,
                createdAt: r.createdAt || new Date().toISOString()
              };
            }),
            likes: typeof updated.likes === 'number' ? updated.likes : 0,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt || new Date().toISOString()
          };
          setPosts(posts.map(p => p.id === selectedPost.id ? normalized : p));
        } else {
          await fetchPosts();
        }
        
        setIsPostModalOpen(false);
        
      } else {
        // Create new post
        const payload = {
          title: postData.title,
          content: postData.content,
          category: postData.category,
          tags: (postData as any)?.tags || []
        };
        
        const response = await fetch(`${API_BASE_URL}/forums`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create post');
        }
        
        const result = await response.json();
        const created = result?.post;
        
        if (created) {
          // Normalize, then prepend
          const authorObj = created.author && typeof created.author === 'object' ? created.author : undefined;
          const normalized: ForumPost = {
            id: created._id ? (typeof created._id === 'string' ? created._id : created._id.toString()) : 
                (created.id ? (typeof created.id === 'string' ? created.id : created.id.toString()) : 
                String(Date.now())),
            title: created.title,
            content: created.content,
            author: typeof created.author === 'string' ? created.author : (authorObj?._id || authorObj?.id || ''),
            authorName: authorObj?.name || created.authorName || user?.name || 'Unknown',
            category: created.category,
            replies: [],
            likes: typeof created.likes === 'number' ? created.likes : 0,
            createdAt: created.createdAt,
            updatedAt: created.updatedAt || created.createdAt
          };
          setPosts([normalized, ...posts]);
        } else {
          await fetchPosts();
        }
        
        setIsPostModalOpen(false);
      }
    } catch (error) {
      console.error('Error saving post:', error);
      setError(error instanceof Error ? error.message : 'Failed to save post. Please try again.');
      throw error; // Re-throw so modal can handle it if needed
    }
  };

  const handleReply = (post: ForumPost) => {
    setReplyingToPost(post);
    setIsReplyModalOpen(true);
  };

  const handleSaveReply = async (content: string) => {
    if (replyingToPost) {
      try {
        setError(null);
        const response = await fetch(`${API_BASE_URL}/forums/${replyingToPost.id}/replies`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ content })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to add reply');
        }

        const result = await response.json();
        const newReply = result.reply;

        // Normalize the new reply
        const replyAuthorObj = newReply.author && typeof newReply.author === 'object' ? newReply.author : undefined;
        const normalizedReply: ReplyType = {
          id: newReply._id ? (typeof newReply._id === 'string' ? newReply._id : newReply._id.toString()) : 
              (newReply.id ? (typeof newReply.id === 'string' ? newReply.id : newReply.id.toString()) : 
              String(Date.now())),
          content: newReply.content,
          author: typeof newReply.author === 'string' ? newReply.author : (replyAuthorObj?._id || replyAuthorObj?.id || ''),
          authorName: replyAuthorObj?.name || newReply.authorName || user?.name || 'Unknown',
          likes: typeof newReply.likes === 'number' ? newReply.likes : 0,
          createdAt: newReply.createdAt || new Date().toISOString()
        };

        // Update posts state with new reply
        setPosts(posts.map(post => 
          post.id === replyingToPost.id 
            ? { ...post, replies: [...post.replies, normalizedReply], updatedAt: new Date().toISOString() }
            : post
        ));
      } catch (error) {
        console.error('Error adding reply:', error);
        setError(error instanceof Error ? error.message : 'Failed to add reply. Please try again.');
      }
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/forums/${postId}/like`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to like post');
      }

      const result = await response.json();
      const isLiked = result.isLiked;

      // Update liked posts state
      if (isLiked) {
        setLikedPosts([...likedPosts, postId]);
      } else {
        setLikedPosts(likedPosts.filter(id => id !== postId));
      }

      // Update posts state with new like count
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, likes: result.likes }
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
      setError(error instanceof Error ? error.message : 'Failed to like post. Please try again.');
    }
  };

  const handleLikeReply = async (postId: string, replyId: string) => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/forums/${postId}/replies/${replyId}/like`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to like reply');
      }

      const result = await response.json();
      const isLiked = result.isLiked;
      const key = `${postId}-${replyId}`;

      // Update liked replies state
      if (isLiked) {
        setLikedReplies([...likedReplies, key]);
      } else {
        setLikedReplies(likedReplies.filter(k => k !== key));
      }

      // Update posts state with new reply like count
      setPosts(posts.map(post => 
        post.id === postId 
          ? {
              ...post,
              replies: post.replies.map(reply =>
                reply.id === replyId
                  ? { ...reply, likes: result.likes }
                  : reply
              )
            }
          : post
      ));
    } catch (error) {
      console.error('Error liking reply:', error);
      setError(error instanceof Error ? error.message : 'Failed to like reply. Please try again.');
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'projects': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'help': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'general': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Forums</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Join discussions and share knowledge</p>
        </div>
        <button 
          onClick={handleCreatePost}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={18} />
          <span>New Post</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="pl-10 pr-8 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[150px]"
            >
              <option value="all">All Categories</option>
              <option value="general">General</option>
              <option value="academic">Academic</option>
              <option value="projects">Projects</option>
              <option value="help">Help</option>
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
          {/* Forum Posts */}
          <div className="space-y-4">
        {filteredPosts.map((post) => (
          <div key={post.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(post.category)}`}>
                    {post.category}
                  </span>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <User size={14} className="mr-1" />
                    {post.authorName}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Clock size={14} className="mr-1" />
                    {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors flex-1">
                    {post.title}
                  </h3>
                  {post.author === user?.id && (
                    <button
                      onClick={() => handleEditPost(post)}
                      className="text-sm text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 ml-2"
                    >
                      Edit
                    </button>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {post.content}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-6">
                <button 
                  onClick={() => handleLikePost(post.id)}
                  className={`flex items-center space-x-2 transition-colors ${
                    likedPosts.includes(post.id)
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  <ThumbsUp size={18} fill={likedPosts.includes(post.id) ? 'currentColor' : 'none'} />
                  <span className="text-sm font-medium">{post.likes}</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                  <MessageSquare size={18} />
                  <span className="text-sm font-medium">{post.replies.length} replies</span>
                </button>
                <button 
                  onClick={() => handleReply(post)}
                  className="flex items-center space-x-2 text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  <Reply size={18} />
                  <span className="text-sm font-medium">Reply</span>
                </button>
              </div>
            </div>

            {/* Replies */}
            {post.replies.length > 0 && (
              <div className="mt-6 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Replies ({post.replies.length})
                </h4>
                <div className="space-y-4">
                  {post.replies.map((reply) => (
                    <div key={reply.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                          <User size={14} />
                          <span>{reply.authorName}</span>
                          <span>•</span>
                          <span>{new Date(reply.createdAt).toLocaleDateString()}</span>
                        </div>
                        <button 
                          onClick={() => handleLikeReply(post.id, reply.id)}
                          className={`flex items-center space-x-1 transition-colors ${
                            likedReplies.includes(`${post.id}-${reply.id}`)
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-gray-500 hover:text-blue-600 dark:hover:text-blue-400'
                          }`}
                        >
                          <ThumbsUp size={14} fill={likedReplies.includes(`${post.id}-${reply.id}`) ? 'currentColor' : 'none'} />
                          <span className="text-sm">{reply.likes}</span>
                        </button>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{reply.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No posts found</h3>
              <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </>
      )}

      <ForumPostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        post={selectedPost}
        onSave={handleSavePost}
      />

      <ReplyModal
        isOpen={isReplyModalOpen}
        onClose={() => setIsReplyModalOpen(false)}
        postTitle={replyingToPost?.title || ''}
        onSave={handleSaveReply}
      />
    </div>
  );
}

export default React.memo(Forums);