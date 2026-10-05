// src/config/socket.js
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('./index.js');
const logger = require('./logger.js');

let io = null;

// Tạo room riêng cho từng user để bắn thông báo đúng người
const userRoom = (userId) => `user:${userId}`;

// Lấy userId từ token (ưu tiên) hoặc từ handshake query (fallback)
const resolveUserId = (socket) => {
    const token =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token;

    if (token) {
        try {
            const decoded = jwt.verify(token, config.jwt.secret);
            return decoded.sub;
        } catch (error) {
            logger.warn(`Socket auth: token không hợp lệ - ${error.message}`);
        }
    }

    // Fallback: cho phép truyền thẳng userId qua query/auth (dùng khi không đính kèm token)
    return socket.handshake.auth?.userId || socket.handshake.query?.userId || null;
};

const initSocket = (httpServer) => {
    const allowedOrigins = [];
    if (config.corsOriginFe) {
        config.corsOriginFe.split(',').forEach((origin) => allowedOrigins.push(origin.trim()));
    }

    io = new Server(httpServer, {
        cors: {
            origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        const userId = resolveUserId(socket);
        if (userId) {
            socket.join(userRoom(userId));
            logger.info(`🔌 Socket connected: ${socket.id} -> room ${userRoom(userId)}`);
        } else {
            logger.warn(`🔌 Socket connected without user identity: ${socket.id}`);
        }

        // Cho phép client tự join lại room (ví dụ sau khi đăng nhập xong mới có userId)
        socket.on('register', (payload) => {
            const id = payload?.userId;
            if (id) {
                socket.join(userRoom(id));
                logger.info(`🔌 Socket ${socket.id} registered to room ${userRoom(id)}`);
            }
        });

        socket.on('disconnect', () => {
            logger.info(`🔌 Socket disconnected: ${socket.id}`);
        });
    });

    logger.info('✅ Socket.IO initialized.');
    return io;
};

const getIO = () => {
    if (!io) {
        logger.warn('Socket.IO chưa được khởi tạo khi getIO() được gọi.');
    }
    return io;
};

// Bắn một event tới một user cụ thể
const emitToUser = (userId, event, payload) => {
    if (!io) return;
    io.to(userRoom(userId)).emit(event, payload);
};

module.exports = {
    initSocket,
    getIO,
    emitToUser,
    userRoom
};
