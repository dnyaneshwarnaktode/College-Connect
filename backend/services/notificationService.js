const Notification = require('../models/Notification');

class NotificationService {
  // Create notification for event registration
  static async createEventRegistrationNotification(userId, eventTitle, eventId) {
    try {
      await Notification.createNotification({
        user: userId,
        type: 'event',
        title: 'Event Registration Confirmed',
        message: `You have successfully registered for "${eventTitle}"`,
        actionUrl: `/events/${eventId}`,
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error creating event registration notification:', error);
    }
  }

  // Create notification for new event
  static async createNewEventNotification(userIds, eventTitle, eventId) {
    try {
      const notifications = userIds.map(userId => ({
        user: userId,
        type: 'event',
        title: 'New Event Posted',
        message: `A new event "${eventTitle}" has been posted`,
        actionUrl: `/events/${eventId}`,
        priority: 'medium'
      }));

      await Notification.insertMany(notifications);
    } catch (error) {
      console.error('Error creating new event notifications:', error);
    }
  }

  // Create notification for forum reply
  static async createForumReplyNotification(userId, postTitle, replyAuthor, postId) {
    try {
      await Notification.createNotification({
        user: userId,
        type: 'forum',
        title: 'New Reply',
        message: `${replyAuthor} replied to your post "${postTitle}"`,
        actionUrl: `/forums/${postId}`,
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error creating forum reply notification:', error);
    }
  }

  // Create notification for project approval
  static async createProjectApprovalNotification(userId, projectTitle, projectId) {
    try {
      await Notification.createNotification({
        user: userId,
        type: 'project',
        title: 'Project Approved',
        message: `Your project "${projectTitle}" has been approved`,
        actionUrl: `/projects/${projectId}`,
        priority: 'high'
      });
    } catch (error) {
      console.error('Error creating project approval notification:', error);
    }
  }

  // Create notification for team invitation
  static async createTeamInvitationNotification(userId, teamName, teamId) {
    try {
      await Notification.createNotification({
        user: userId,
        type: 'team',
        title: 'Team Invitation',
        message: `You have been invited to join "${teamName}"`,
        actionUrl: `/teams/${teamId}`,
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error creating team invitation notification:', error);
    }
  }

  // Create system announcement
  static async createSystemAnnouncement(userIds, title, message, actionUrl = null) {
    try {
      const notifications = userIds.map(userId => ({
        user: userId,
        type: 'announcement',
        title,
        message,
        actionUrl,
        priority: 'high'
      }));

      await Notification.insertMany(notifications);
    } catch (error) {
      console.error('Error creating system announcement:', error);
    }
  }

  // Create event reminder notification
  static async createEventReminderNotification(userIds, eventTitle, eventId, reminderTime) {
    try {
      const notifications = userIds.map(userId => ({
        user: userId,
        type: 'event',
        title: 'Event Reminder',
        message: `Reminder: "${eventTitle}" is starting soon`,
        actionUrl: `/events/${eventId}`,
        priority: 'high',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expire after 24 hours
      }));

      await Notification.insertMany(notifications);
    } catch (error) {
      console.error('Error creating event reminder notifications:', error);
    }
  }

  // Get all users for bulk notifications
  static async getAllUsers() {
    try {
      const User = require('./User');
      const users = await User.find({ isActive: true }).select('_id');
      return users.map(user => user._id);
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  // Get users by department
  static async getUsersByDepartment(department) {
    try {
      const User = require('./User');
      const users = await User.find({ 
        department, 
        isActive: true 
      }).select('_id');
      return users.map(user => user._id);
    } catch (error) {
      console.error('Error getting users by department:', error);
      return [];
    }
  }

  // Get users by role
  static async getUsersByRole(role) {
    try {
      const User = require('./User');
      const users = await User.find({ 
        role, 
        isActive: true 
      }).select('_id');
      return users.map(user => user._id);
    } catch (error) {
      console.error('Error getting users by role:', error);
      return [];
    }
  }
}

module.exports = NotificationService;
