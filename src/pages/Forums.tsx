import React, { useState } from 'react';
import { MessageSquare, ThumbsUp, Reply, Plus, Search, Filter, Clock, User } from 'lucide-react';
import ForumPostModal from '../components/Modals/ForumPostModal';
import ReplyModal from '../components/Modals/ReplyModal';
import { ForumPost, Reply as ReplyType } from '../types';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Forums() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  // removed unused loading state
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
      const response = await fetch(`${API_BASE_URL}/forums`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      // no-op
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

  const handleSavePost = (postData: Partial<ForumPost>) => {
    if (selectedPost) {
      // Edit existing post
      setPosts(posts.map(post => 
        post.id === selectedPost.id 
          ? { ...post, ...postData, updatedAt: new Date().toISOString() }
          : post
      ));
    } else {
      // Create new post
      const { id: _ignoredId, ...restPostData } = (postData || {}) as ForumPost;
      const newPost: ForumPost = {
        ...restPostData,
        id: Date.now().toString(),
        author: user?.id || '1',
        authorName: user?.name || 'Anonymous',
        replies: [],
        likes: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setPosts([newPost, ...posts]);
    }
  };

  const handleReply = (post: ForumPost) => {
    setReplyingToPost(post);
    setIsReplyModalOpen(true);
  };

  const handleSaveReply = (content: string) => {
    if (replyingToPost) {
      const newReply: ReplyType = {
        id: Date.now().toString(),
        content,
        author: user?.id || '1',
        authorName: user?.name || 'Anonymous',
        likes: 0,
        createdAt: new Date().toISOString()
      };

      setPosts(posts.map(post => 
        post.id === replyingToPost.id 
          ? { ...post, replies: [...post.replies, newReply], updatedAt: new Date().toISOString() }
          : post
      ));
    }
  };

  const handleLikePost = (postId: string) => {
    if (!likedPosts.includes(postId)) {
      setLikedPosts([...likedPosts, postId]);
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, likes: post.likes + 1 }
          : post
      ));
    }
  };

  const handleLikeReply = (postId: string, replyId: string) => {
    const key = `${postId}-${replyId}`;
    if (!likedReplies.includes(key)) {
      setLikedReplies([...likedReplies, key]);
      setPosts(posts.map(post => 
        post.id === postId 
          ? {
              ...post,
              replies: post.replies.map(reply =>
                reply.id === replyId
                  ? { ...reply, likes: reply.likes + 1 }
                  : reply
              )
            }
          : post
      ));
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
                  disabled={likedPosts.includes(post.id)}
                  className={`flex items-center space-x-2 transition-colors ${
                    likedPosts.includes(post.id)
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  <ThumbsUp size={18} />
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
                          disabled={likedReplies.includes(`${post.id}-${reply.id}`)}
                          className={`flex items-center space-x-1 transition-colors ${
                            likedReplies.includes(`${post.id}-${reply.id}`)
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-gray-500 hover:text-blue-600 dark:hover:text-blue-400'
                          }`}
                        >
                          <ThumbsUp size={14} />
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