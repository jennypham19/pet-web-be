// src/services/notification.service.js
const { Notification, User, sequelize } = require('../models');
const { StatusCodes } = require('http-status-codes');
const ApiError = require('../utils/ApiError');
const { emitToUser } = require('../config/socket.js');

// Chuẩn hóa dữ liệu thông báo trả về cho FE
const formatNotification = (notificationInstance) => {
    const data = notificationInstance.toJSON ? notificationInstance.toJSON() : notificationInstance;
    return {
        id: data.id,
        type: data.type,
        title: data.title,
        message: data.message,
        reason: data.reason ?? null,
        metadata: data.metadata ?? null,
        isRead: data.is_read,
        taskId: data.task_id ?? null,
        senderId: data.sender_id ?? null,
        sender: data.sender ? { id: data.sender.id, name: data.sender.name, role: data.sender.role } : null,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
    };
};

/**
 * Tạo một thông báo và bắn realtime tới người nhận qua Socket.IO
 * @param {Object} payload
 * @param {string} payload.recipientId - người nhận
 * @param {string} [payload.senderId] - người tạo hành động
 * @param {string} [payload.taskId] - công việc liên quan
 * @param {string} [payload.type] - loại thông báo
 * @param {string} payload.title
 * @param {string} payload.message
 * @param {string} [payload.reason]
 * @param {Object} [payload.metadata]
 * @param {import('sequelize').Transaction} [transaction]
 */
const createNotification = async (payload, transaction) => {
    const {
        recipientId,
        senderId = null,
        taskId = null,
        type = 'image_deleted',
        title,
        message,
        reason = null,
        metadata = null
    } = payload;

    const notification = await Notification.create({
        recipient_id: recipientId,
        sender_id: senderId,
        task_id: taskId,
        type,
        title,
        message,
        reason,
        metadata
    }, transaction ? { transaction } : undefined);

    const unreadCount = await Notification.count({
        where: { recipient_id: recipientId, is_read: false },
        transaction
    });

    const formatted = formatNotification(notification);

    // Bắn realtime: một event cho bản ghi mới + số badge chưa đọc
    emitToUser(recipientId, 'notification:new', { notification: formatted, unreadCount });

    return formatted;
};

// Lấy danh sách thông báo của 1 user
const queryNotifications = async (userId, queryOptions = {}) => {
    try {
        const page = Number(queryOptions.page) || 1;
        const limit = Number(queryOptions.limit) || 20;
        const offset = (page - 1) * limit;

        const { count, rows } = await Notification.findAndCountAll({
            where: { recipient_id: userId },
            include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'role'] }],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
            distinct: true
        });

        const unreadCount = await Notification.count({
            where: { recipient_id: userId, is_read: false }
        });

        return {
            data: rows.map(formatNotification),
            unreadCount,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        };
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Đã có lỗi xảy ra khi lấy thông báo: ' + error.message);
    }
};

// Lấy số thông báo chưa đọc
const getUnreadCount = async (userId) => {
    try {
        const unreadCount = await Notification.count({
            where: { recipient_id: userId, is_read: false }
        });
        return { unreadCount };
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Đã có lỗi xảy ra: ' + error.message);
    }
};

// Đánh dấu 1 thông báo đã đọc
const markAsRead = async (userId, notificationId) => {
    try {
        const notification = await Notification.findOne({
            where: { id: notificationId, recipient_id: userId }
        });
        if (!notification) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy thông báo.');
        }
        if (!notification.is_read) {
            notification.is_read = true;
            await notification.save();
        }
        const { unreadCount } = await getUnreadCount(userId);
        return { unreadCount };
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Đã có lỗi xảy ra: ' + error.message);
    }
};

// Đánh dấu tất cả thông báo đã đọc
const markAllAsRead = async (userId) => {
    try {
        await Notification.update(
            { is_read: true },
            { where: { recipient_id: userId, is_read: false } }
        );
        return { unreadCount: 0 };
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Đã có lỗi xảy ra: ' + error.message);
    }
};

module.exports = {
    createNotification,
    queryNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    formatNotification
};
