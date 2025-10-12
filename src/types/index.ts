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

export interface TeamChat {
  id: string;
  team: string;
  sender: string;
  senderName: string;
  message: string;
  messageType: 'text' | 'image' | 'file' | 'link';
  attachments?: {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
  }[];
  replyTo?: string;
  isEdited: boolean;
  editedAt?: string;
  reactions: {
    user: string;
    emoji: string;
    createdAt: string;
  }[];
  createdAt: string;
}



export interface ClassGroup {
  id: string;
  name: string;
  description: string;
  subject: string;
  courseCode: string;
  semester: '1st' | '2nd' | '3rd' | '4th' | '5th' | '6th' | '7th' | '8th';
  academicYear: string;
  teacher: string;
  teacherName: string;
  joinKey: string;
  students: {
    user: string;
    userName: string;
    studentId: string;
    joinedAt: string;
    isActive: boolean;
  }[];
  maxStudents: number;
  isActive: boolean;
  settings: {
    allowStudentChat: boolean;
    allowStudentPosts: boolean;
    requireApprovalForPosts: boolean;
    allowFileSharing: boolean;
  };
  announcements: {
    id: string;
    title: string;
    content: string;
    createdBy: string;
    createdByName: string;
    priority: 'low' | 'medium' | 'high';
    isPinned: boolean;
    expiresAt?: string;
    createdAt: string;
  }[];
  assignments: {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    maxPoints: number;
    attachments: {
      filename: string;
      originalName: string;
      url: string;
      size: number;
    }[];
    submissions: {
      student: string;
      studentName: string;
      submittedAt: string;
      files: {
        filename: string;
        originalName: string;
        url: string;
        size: number;
      }[];
      grade?: number;
      feedback?: string;
      gradedAt?: string;
      gradedBy?: string;
    }[];
    createdBy: string;
    createdByName: string;
    isActive: boolean;
    createdAt: string;
  }[];
  files: {
    id: string;
    fileName: string;
    originalName: string;
    fileType: string;
    fileSize: number;
    fileUrl: string;
    uploadedBy: string;
    uploadedByName: string;
    uploadedAt: string;
    description: string;
    category: 'lecture' | 'assignment' | 'resource' | 'announcement';
  }[];
  doubts: {
    id: string;
    student: string;
    studentName: string;
    studentId: string;
    question: string;
    description: string;
    attachments: {
      filename: string;
      originalName: string;
      url: string;
      size: number;
    }[];
    status: 'pending' | 'answered' | 'resolved';
    answer?: {
      text: string;
      answeredBy: string;
      answeredByName: string;
      answeredAt: string;
      attachments: {
        filename: string;
        originalName: string;
        url: string;
        size: number;
      }[];
    };
    createdAt: string;
    updatedAt: string;
  }[];
  statistics: {
    totalStudents: number;
    activeStudents: number;
    totalAssignments: number;
    completedAssignments: number;
    averageGrade: number;
    totalFiles: number;
    totalDoubts: number;
    pendingDoubts: number;
  };
  createdAt: string;
}