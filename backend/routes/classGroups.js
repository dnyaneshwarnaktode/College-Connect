const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const {
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
} = require('../controllers/classGroupController');
const { protect } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types for now
    cb(null, true);
  }
});

// All routes are protected
router.use(protect);

// @route   POST /api/class-groups
// @desc    Create new class group
// @access  Private (Faculty only)
router.post('/', createClassGroup);

// @route   GET /api/class-groups/teacher
// @desc    Get all class groups for teacher
// @access  Private (Faculty only)
router.get('/teacher', getTeacherClassGroups);

// @route   GET /api/class-groups/student
// @desc    Get all class groups for student
// @access  Private (Student only)
router.get('/student', getStudentClassGroups);

// @route   POST /api/class-groups/join
// @desc    Join class group with join key
// @access  Private (Student only)
router.post('/join', joinClassGroup);

// SPECIFIC ROUTES MUST COME BEFORE GENERAL /:id ROUTE

// @route   POST /api/class-groups/:id/announcements
// @desc    Create announcement
// @access  Private (Teacher only)
router.post('/:id/announcements', createAnnouncement);

// @route   POST /api/class-groups/:id/assignments
// @desc    Create assignment
// @access  Private (Teacher only)
router.post('/:id/assignments', createAssignment);

// @route   POST /api/class-groups/:id/assignments/:assignmentId/submit
// @desc    Submit assignment
// @access  Private (Student member only)
router.post('/:id/assignments/:assignmentId/submit', submitAssignment);

// @route   PUT /api/class-groups/:id/assignments/:assignmentId/submissions/:submissionId/grade
// @desc    Grade assignment
// @access  Private (Teacher only)
router.put('/:id/assignments/:assignmentId/submissions/:submissionId/grade', gradeAssignment);

// @route   POST /api/class-groups/:id/files
// @desc    Upload file to class group
// @access  Private (Teacher only)
router.post('/:id/files', upload.single('file'), uploadFile);

// @route   GET /api/class-groups/:id/files
// @desc    Get files from class group
// @access  Private (Teacher or Student member)
router.get('/:id/files', getFiles);

// @route   POST /api/class-groups/:id/doubts
// @desc    Create doubt/question
// @access  Private (Student member only)
router.post('/:id/doubts', createDoubt);

// @route   GET /api/class-groups/:id/doubts
// @desc    Get doubts from class group
// @access  Private (Teacher or Student member)
router.get('/:id/doubts', getDoubts);

// @route   PUT /api/class-groups/:id/doubts/:doubtId/answer
// @desc    Answer doubt
// @access  Private (Teacher only)
router.put('/:id/doubts/:doubtId/answer', answerDoubt);

// @route   DELETE /api/class-groups/:id/students/:studentId
// @desc    Remove student from class group
// @access  Private (Teacher only)
router.delete('/:id/students/:studentId', removeStudent);

// GENERAL ROUTES MUST COME AFTER SPECIFIC ROUTES

// @route   GET /api/class-groups/:id
// @desc    Get single class group
// @access  Private (Teacher or Student member)
router.get('/:id', getClassGroup);

// @route   PUT /api/class-groups/:id
// @desc    Update class group
// @access  Private (Teacher only)
router.put('/:id', updateClassGroup);

module.exports = router;