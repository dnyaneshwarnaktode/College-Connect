export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'faculty' | 'student';
  avatar?: string;
  department?: string;
  year?: number;
  phone?: string;
  bio?: string;
  skills?: string[];
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: 'academic' | 'cultural' | 'sports' | 'technical';
  organizer: string;
  capacity: number;
  registered: number;
  image?: string;
  createdBy: string;
  createdAt: string;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: string;
  authorName: string;
  category: 'general' | 'academic' | 'projects' | 'help';
  replies: Reply[];
  likes: number;
  createdAt: string;
  updatedAt: string;
}

export interface Reply {
  id: string;
  content: string;
  author: string;
  authorName: string;
  likes: number;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  category: 'web' | 'mobile' | 'ai' | 'data' | 'other';
  status: 'planning' | 'active' | 'completed';
  owner: string;
  ownerName: string;
  members: string[];
  githubUrl?: string;
  liveUrl?: string;
  image?: string;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  type: 'club' | 'project' | 'competition';
  leader: string;
  leaderName: string;
  members: string[];
  maxMembers: number;
  isOpen: boolean;
  tags: string[];
  createdAt: string;
}