// src/server.js

const http = require('http');
const app = require('./app');
const config = require('../src/config');
const logger = require('./config/logger.js');
const { sequelize } = require('../src/models');

let httpServer;
const startServer = async () => {
    try {
        // 1. Xác thực kết nối database
        await sequelize.authenticate();
        logger.info('✅ Database connection has been established successfully.');

        // 2. Tạo HTTP server từ Express app
        httpServer = http.createServer(app);

        //3. Lắng nghe trên port đã cấu hình
        httpServer.listen(config.port, () => {
            logger.info(`🚀 Server is listening on port ${config.port} in ${config.env} mode`);
            logger.info(`📄 API Docs available at http://localhost:${config.port}/api-docs`);
        });
    } catch (error) {
        logger.error('❌ Failed to start server or connect to the database:', error);
        process.exit(1)
    }
};

startServer();

// --- Xử lý Graceful Shutdown

const exitHandler = () => {
    if(httpServer){
        httpServer.close(() => {
            logger.info('Server closed. ');
            process.exit(1);
        });
    }else{
        process.exit(1);
    }
};

const unexpectedErrorHandler = (error, origin) => {
  logger.error(`UNHANDLED ${origin}! Shutting down...`);
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', (error) => unexpectedErrorHandler(error, 'UNCAUGHT EXCEPTION'));
process.on('unhandledRejection', (reason) => unexpectedErrorHandler(reason, 'UNHANDLED REJECTION'));
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully.');
  exitHandler();
});
process.on('SIGINT', () => {
  logger.info('SIGINT (Ctrl+C) received, shutting down gracefully.');
  exitHandler();
});