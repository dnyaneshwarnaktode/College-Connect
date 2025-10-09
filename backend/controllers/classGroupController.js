const ClassGroup = require('../models/ClassGroup');
const User = require('../models/User');

// @desc    Create new class group
// @route   POST /api/class-groups
// @access  Private (Faculty only)
const createClassGroup = async (req, res) => {
  try {
    console.log('Creating class group...');
    console.log('Request user:', req.user);
    console.log('Request body:', req.body);
    
    const {
      name,
      description,
      subject,
      courseCode,
      semester,
      academicYear,
      maxStudents,
      settings
    } = req.body;

    // Check if user is faculty
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Faculty role required.' });
    }

    const classGroup = await ClassGroup.create({
      name,
      description,
      subject,
      courseCode,
      semester,
      academicYear,
      teacher: req.user.id,
      maxStudents: maxStudents || 50,
      settings: settings || {}
    });

    const populatedClassGroup = await ClassGroup.findById(classGroup._id)
      .populate('teacher', 'name email');

    // Transform _id to id for frontend compatibility
    const transformedClassGroup = {
      ...populatedClassGroup.toObject(),
      id: populatedClassGroup._id.toString(),
      teacherName: populatedClassGroup.teacher.name
    };

    res.status(201).json({
      success: true,
      data: transformedClassGroup
    });
  } catch (error) {
    console.error('Error creating class group:', error);
    console.error('Error details:', error.message);
    console.error('Request body:', req.body);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Get all class groups for teacher
// @route   GET /api/class-groups/teacher
// @access  Private (Faculty only)
const getTeacherClassGroups = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const classGroups = await ClassGroup.find({ teacher: req.user.id })
      .populate('teacher', 'name email')
      .populate('students.user', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(skip);

    const totalClassGroups = await ClassGroup.countDocuments({ teacher: req.user.id });

    // Transform _id to id for frontend compatibility
    const transformedClassGroups = classGroups.map(group => ({
      ...group.toObject(),
      id: group._id.toString(),
      teacherName: group.teacher.name,
      students: group.students.map(student => ({
        ...student.toObject(),
        userName: student.user.name
      }))
    }));

    res.json({
      success: true,
      data: {
        classGroups: transformedClassGroups,
        pagination: {
          current: page,
          pages: Math.ceil(totalClassGroups / limit),
          total: totalClassGroups
        }
      }
    });
  } catch (error) {
    console.error('Error fetching teacher class groups:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all class groups for student
// @route   GET /api/class-groups/student
// @access  Private (Student only)
const getStudentClassGroups = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const classGroups = await ClassGroup.find({
      'students.user': req.user.id,
      'students.isActive': true
    })
      .populate('teacher', 'name email')
      .populate('students.user', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(skip);

    const totalClassGroups = await ClassGroup.countDocuments({
      'students.user': req.user.id,
      'students.isActive': true
    });

    // Transform _id to id for frontend compatibility
    const transformedClassGroups = classGroups.map(group => ({
      ...group.toObject(),
      id: group._id.toString(),
      teacherName: group.teacher.name,
      students: group.students.map(student => ({
        ...student.toObject(),
        userName: student.user.name
      }))
    }));

    res.json({
      success: true,
      data: {
        classGroups: transformedClassGroups,
        pagination: {
          current: page,
          pages: Math.ceil(totalClassGroups / limit),
          total: totalClassGroups
        }
      }
    });
  } catch (error) {
    console.error('Error fetching student class groups:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Join class group with join key
// @route   POST /api/class-groups/join
// @access  Private (Student only)
const joinClassGroup = async (req, res) => {
  try {
    const { joinKey, studentId } = req.body;

    // Check if user is student
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Student role required.' });
    }

    const classGroup = await ClassGroup.findOne({ joinKey });

    if (!classGroup) {
      return res.status(404).json({ message: 'Invalid join key' });
    }

    if (!classGroup.isActive) {
      return res.status(400).json({ message: 'Class group is not active' });
    }

    try {
      await classGroup.addStudent(req.user.id, studentId);

      const populatedClassGroup = await ClassGroup.findById(classGroup._id)
        .populate('teacher', 'name email')
        .populate('students.user', 'name email avatar');

      res.json({
        success: true,
        data: populatedClassGroup,
        message: 'Successfully joined class group'
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } catch (error) {
    console.error('Error joining class group:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single class group
// @route   GET /api/class-groups/:id
// @access  Private (Teacher or Student member)
const getClassGroup = async (req, res) => {
  try {
    const classGroup = await ClassGroup.findById(req.params.id)
      .populate('teacher', 'name email avatar')
      .populate('students.user', 'name email avatar')
      .populate('announcements.createdBy', 'name')
      .populate('assignments.createdBy', 'name')
      .populate('assignments.submissions.student', 'name')
      .populate('assignments.submissions.gradedBy', 'name');

    if (!classGroup) {
      return res.status(404).json({ message: 'Class group not found' });
    }

    // Check if user has access to this class group
    const isTeacher = classGroup.teacher._id.toString() === req.user.id;
    const isStudent = classGroup.students.some(
      student => student.user._id.toString() === req.user.id && student.isActive
    );

    if (!isTeacher && !isStudent) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Transform _id to id for frontend compatibility
    const transformedClassGroup = {
      ...classGroup.toObject(),
      id: classGroup._id.toString(),
      teacherName: classGroup.teacher.name,
      students: classGroup.students.map(student => ({
        ...student.toObject(),
        userName: student.user.name
      })),
      announcements: classGroup.announcements.map(announcement => ({
        ...announcement.toObject(),
        id: announcement._id.toString(),
        createdByName: announcement.createdBy.name
      })),
      assignments: classGroup.assignments.map(assignment => ({
        ...assignment.toObject(),
        id: assignment._id.toString(),
        createdByName: assignment.createdBy.name,
        submissions: assignment.submissions.map(submission => ({
          ...submission.toObject(),
          id: submission._id.toString(),
          studentName: submission.student.name,
          gradedByName: submission.gradedBy?.name
        }))
      })),
      files: classGroup.files.map(file => ({
        ...file.toObject(),
        id: file._id.toString(),
        uploadedByName: file.uploadedBy?.name || 'Unknown'
      })),
      doubts: classGroup.doubts.map(doubt => ({
        ...doubt.toObject(),
        id: doubt._id.toString(),
        studentName: doubt.student.name,
        answer: doubt.answer ? {
          ...doubt.answer.toObject(),
          answeredByName: doubt.answer.answeredBy?.name || 'Unknown'
        } : undefined
      }))
    };

    res.json({
      success: true,
      data: transformedClassGroup
    });
  } catch (error) {
    console.error('Error fetching class group:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update class group
// @route   PUT /api/class-groups/:id
// @access  Private (Teacher only)
const updateClassGroup = async (req, res) => {
  try {
    const classGroup = await ClassGroup.findById(req.params.id);

    if (!classGroup) {
      return res.status(404).json({ message: 'Class group not found' });
    }

    // Check if user is the teacher
    if (classGroup.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedClassGroup = await ClassGroup.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('teacher', 'name email')
      .populate('students.user', 'name email avatar');

    res.json({
      success: true,
      data: updatedClassGroup
    });
  } catch (error) {
    console.error('Error updating class group:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove student from class group
// @route   DELETE /api/class-groups/:id/students/:studentId
// @access  Private (Teacher only)
const removeStudent = async (req, res) => {
  try {
    const { id, studentId } = req.params;

    const classGroup = await ClassGroup.findById(id);

    if (!classGroup) {
      return res.status(404).json({ message: 'Class group not found' });
    }

    // Check if user is the teacher
    if (classGroup.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    try {
      await classGroup.removeStudent(studentId);

      const updatedClassGroup = await ClassGroup.findById(id)
        .populate('teacher', 'name email')
        .populate('students.user', 'name email avatar');

      res.json({
        success: true,
        data: updatedClassGroup,
        message: 'Student removed successfully'
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } catch (error) {
    console.error('Error removing student:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create announcement
// @route   POST /api/class-groups/:id/announcements
// @access  Private (Teacher only)
const createAnnouncement = async (req, res) => {
  try {
    const { title, content, priority = 'medium', isPinned = false, expiresAt } = req.body;

    const classGroup = await ClassGroup.findById(req.params.id);

    if (!classGroup) {
      return res.status(404).json({ message: 'Class group not found' });
    }

    // Check if user is the teacher
    if (classGroup.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    classGroup.announcements.push({
      title,
      content,
      createdBy: req.user.id,
      priority,
      isPinned,
      expiresAt
    });

    await classGroup.save();

    const populatedClassGroup = await ClassGroup.findById(classGroup._id)
      .populate('announcements.createdBy', 'name');

    res.status(201).json({
      success: true,
      data: populatedClassGroup.announcements[populatedClassGroup.announcements.length - 1]
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create assignment
// @route   POST /api/class-groups/:id/assignments
// @access  Private (Teacher only)
const createAssignment = async (req, res) => {
  try {
    const {
      title,
      description,
      dueDate,
      maxPoints,
      attachments
    } = req.body;

    const classGroup = await ClassGroup.findById(req.params.id);

    if (!classGroup) {
      return res.status(404).json({ message: 'Class group not found' });
    }

    // Check if user is the teacher
    if (classGroup.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    classGroup.assignments.push({
      title,
      description,
      dueDate,
      maxPoints,
      attachments,
      createdBy: req.user.id
    });

    await classGroup.save();

    const populatedClassGroup = await ClassGroup.findById(classGroup._id)
      .populate('assignments.createdBy', 'name');

    res.status(201).json({
      success: true,
      data: populatedClassGroup.assignments[populatedClassGroup.assignments.length - 1]
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Submit assignment
// @route   POST /api/class-groups/:id/assignments/:assignmentId/submit
// @access  Private (Student member only)
const submitAssignment = async (req, res) => {
  try {
    const { id, assignmentId } = req.params;
    const { files } = req.body;

    const classGroup = await ClassGroup.findById(id);

    if (!classGroup) {
      return res.status(404).json({ message: 'Class group not found' });
    }

    // Check if user is student member
    const isStudent = classGroup.students.some(
      student => student.user.toString() === req.user.id && student.isActive
    );

    if (!isStudent) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const assignment = classGroup.assignments.id(assignmentId);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if already submitted
    const existingSubmission = assignment.submissions.find(
      submission => submission.student.toString() === req.user.id
    );

    if (existingSubmission) {
      return res.status(400).json({ message: 'Assignment already submitted' });
    }

    assignment.submissions.push({
      student: req.user.id,
      files
    });

    await classGroup.save();

    res.status(201).json({
      success: true,
      message: 'Assignment submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Grade assignment
// @route   PUT /api/class-groups/:id/assignments/:assignmentId/submissions/:submissionId/grade
// @access  Private (Teacher only)
const gradeAssignment = async (req, res) => {
  try {
    const { id, assignmentId, submissionId } = req.params;
    const { grade, feedback } = req.body;

    const classGroup = await ClassGroup.findById(id);

    if (!classGroup) {
      return res.status(404).json({ message: 'Class group not found' });
    }

    // Check if user is the teacher
    if (classGroup.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const assignment = classGroup.assignments.id(assignmentId);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const submission = assignment.submissions.id(submissionId);

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    submission.grade = grade;
    submission.feedback = feedback;
    submission.gradedAt = new Date();
    submission.gradedBy = req.user.id;

    await classGroup.save();

    res.json({
      success: true,
      message: 'Assignment graded successfully'
    });
  } catch (error) {
    console.error('Error grading assignment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload file to class group
const uploadFile = async (req, res) => {
  try {
    const { id: classGroupId } = req.params;
    const { description, category } = req.body;

    const classGroup = await ClassGroup.findById(classGroupId);
    if (!classGroup) {
      return res.status(404).json({ message: 'Class group not found' });
    }

    // Check if user is teacher or admin
    if (classGroup.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileData = {
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      fileUrl: `/uploads/${req.file.filename}`,
      uploadedBy: req.user.id,
      description: description || '',
      category: category || 'resource'
    };

    classGroup.files.push(fileData);
    await classGroup.save();

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: fileData
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get files from class group
const getFiles = async (req, res) => {
  try {
    const { id: classGroupId } = req.params;

    const classGroup = await ClassGroup.findById(classGroupId)
      .populate('files.uploadedBy', 'name email');

    if (!classGroup) {
      return res.status(404).json({ message: 'Class group not found' });
    }

    // Check if user is teacher, student in class, or admin
    const isTeacher = classGroup.teacher.toString() === req.user.id;
    const isStudent = classGroup.students.some(student => 
      student.user.toString() === req.user.id && student.isActive
    );

    if (!isTeacher && !isStudent && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      success: true,
      data: classGroup.files
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create doubt/question
const createDoubt = async (req, res) => {
  try {
    const { id: classGroupId } = req.params;
    const { question, description, studentId } = req.body;

    const classGroup = await ClassGroup.findById(classGroupId);
    if (!classGroup) {
      return res.status(404).json({ message: 'Class group not found' });
    }

    // Check if user is student in class
    const isStudent = classGroup.students.some(student => 
      student.user.toString() === req.user.id && student.isActive
    );

    if (!isStudent && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const doubtData = {
      student: req.user.id,
      studentId: studentId || '',
      question,
      description: description || '',
      status: 'pending'
    };

    classGroup.doubts.push(doubtData);
    await classGroup.save();

    res.status(201).json({
      success: true,
      message: 'Doubt submitted successfully',
      data: doubtData
    });
  } catch (error) {
    console.error('Error creating doubt:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get doubts from class group
const getDoubts = async (req, res) => {
  try {
    const { id: classGroupId } = req.params;

    const classGroup = await ClassGroup.findById(classGroupId)
      .populate('doubts.student', 'name email')
      .populate('doubts.answer.answeredBy', 'name email');

    if (!classGroup) {
      return res.status(404).json({ message: 'Class group not found' });
    }

    // Check if user is teacher, student in class, or admin
    const isTeacher = classGroup.teacher.toString() === req.user.id;
    const isStudent = classGroup.students.some(student => 
      student.user.toString() === req.user.id && student.isActive
    );

    if (!isTeacher && !isStudent && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      success: true,
      data: classGroup.doubts
    });
  } catch (error) {
    console.error('Error fetching doubts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Answer doubt
const answerDoubt = async (req, res) => {
  try {
    const { id: classGroupId, doubtId } = req.params;
    const { answer } = req.body;

    const classGroup = await ClassGroup.findById(classGroupId);
    if (!classGroup) {
      return res.status(404).json({ message: 'Class group not found' });
    }

    // Check if user is teacher or admin
    if (classGroup.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const doubt = classGroup.doubts.id(doubtId);
    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    doubt.answer = {
      text: answer,
      answeredBy: req.user.id,
      answeredAt: new Date()
    };
    doubt.status = 'answered';
    doubt.updatedAt = new Date();

    await classGroup.save();

    res.json({
      success: true,
      message: 'Doubt answered successfully'
    });
  } catch (error) {
    console.error('Error answering doubt:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createClassGroup,
  getTeacherClassGroups,
  getStudentClassGroups,
  joinClassGroup,
  getClassGroup,
  updateClassGroup,
  removeStudent,
  createAnnouncement,
  createAssignment,
  submitAssignment,
  gradeAssignment,
  uploadFile,
  getFiles,
  createDoubt,
  getDoubts,
  answerDoubt
};