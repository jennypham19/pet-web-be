// src/controllers/notification.controller.js
const { StatusCodes } = require('http-status-codes');
const catchAsync = require('../utils/catchAsync');
const notificationService = require('../services/notification.service.js');
const pick = require('../utils/pick');

// Lấy danh sách thông báo của người dùng hiện tại
const getNotifications = catchAsync(async (req, res) => {
    const queryOptions = pick(req.query, ['page', 'limit']);
    const result = await notificationService.queryNotifications(req.user.id, queryOptions);
    res.status(StatusCodes.OK).send({ success: true, message: 'Lấy danh sách thông báo thành công', data: result });
});

// Lấy số thông báo chưa đọc (badge)
const getUnreadCount = catchAsync(async (req, res) => {
    const result = await notificationService.getUnreadCount(req.user.id);
    res.status(StatusCodes.OK).send({ success: true, message: 'Lấy số thông báo chưa đọc thành công', data: result });
});

// Đánh dấu 1 thông báo đã đọc
const markAsRead = catchAsync(async (req, res) => {
    const result = await notificationService.markAsRead(req.user.id, req.params.id);
    res.status(StatusCodes.OK).send({ success: true, message: 'Đã đánh dấu đã đọc', data: result });
});

// Đánh dấu tất cả đã đọc
const markAllAsRead = catchAsync(async (req, res) => {
    const result = await notificationService.markAllAsRead(req.user.id);
    res.status(StatusCodes.OK).send({ success: true, message: 'Đã đánh dấu tất cả đã đọc', data: result });
});

module.exports = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
};
