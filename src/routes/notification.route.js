// src/routes/notification.route.js
const express = require('express');

const { protect } = require('../middlewares/auth');
const notificationController = require('../controllers/notification.controller');
const notificationValidation = require('../validations/notification.validation');
const validate = require('../middlewares/validate');

const router = express.Router();

// Mọi vai trò đã đăng nhập đều có thể xem thông báo của chính mình
router.use(protect);

// Lấy danh sách thông báo
router.get(
    '/list-notifications',
    validate(notificationValidation.getNotifications),
    notificationController.getNotifications
);

// Lấy số thông báo chưa đọc (badge)
router.get(
    '/unread-count',
    notificationController.getUnreadCount
);

// Đánh dấu 1 thông báo đã đọc
router.patch(
    '/read/:id',
    validate(notificationValidation.markAsRead),
    notificationController.markAsRead
);

// Đánh dấu tất cả đã đọc
router.patch(
    '/read-all',
    notificationController.markAllAsRead
);

module.exports = router;
