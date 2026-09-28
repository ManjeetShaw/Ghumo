const Notification = require('../models/notification.model');
const { notificationQueue, emailQueue, refundQueue } = require('../queues/queue.config');

class NotificationService {
  async getUserNotifications(userId, query = {}) {
    const { isRead, limit = 20, page = 1 } = query;
    const filter = { userId };

    if (isRead !== undefined) {
      filter.isRead = isRead === 'true';
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId, isRead: false }),
    ]);

    return {
      notifications,
      unreadCount,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / parseInt(limit, 10)),
      },
    };
  }

  async markAsRead(userId, notificationId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      const error = new Error('Notification not found');
      error.statusCode = 404;
      error.errorCode = 'NOT_FOUND';
      throw error;
    }

    return notification;
  }

  async enqueueNotification({ userId, title, message, type, data }) {
    if (process.env.NODE_ENV === 'test') {
      await Notification.create({
        userId,
        title,
        message,
        type,
        data,
      });
    }
    return await notificationQueue.add('sendNotification', {
      userId,
      title,
      message,
      type,
      data,
    });
  }

  async enqueueEmail({ to, subject, type, bookingReference, user }) {
    return await emailQueue.add('sendEmail', {
      to,
      subject,
      type,
      bookingReference,
      user,
    });
  }

  async enqueueRefund({ bookingId, orderId, amount, reason }) {
    return await refundQueue.add('processRefund', {
      bookingId,
      orderId,
      amount,
      reason,
    });
  }
}

module.exports = new NotificationService();
