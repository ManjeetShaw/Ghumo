const notificationService = require('../services/notification.service');
const { successResponse } = require('../utils/apiResponse');

class NotificationController {
  async getUserNotifications(req, res, next) {
    try {
      const result = await notificationService.getUserNotifications(req.user._id, req.query);
      return successResponse(res, result, 'User notifications retrieved successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const notification = await notificationService.markAsRead(req.user._id, req.params.id);
      return successResponse(res, { notification }, 'Notification marked as read', 200);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new NotificationController();
