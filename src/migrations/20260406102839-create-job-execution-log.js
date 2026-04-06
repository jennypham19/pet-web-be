'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('JobExecutionLogs', { // Tên bảng thường là số nhiều
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        allowNull: false,
        primaryKey: true
      },
      job_name: { // Tên của job, ví dụ: 'rolloverDailyTasks', 'cleanupExpiredTokens'
        type: Sequelize.STRING,
        allowNull: false
      },
      run_date: { // Ngày mà job này được dự kiến chạy cho (quan trọng cho daily tasks)
        type: Sequelize.DATEONLY, // Chỉ lưu ngày YYYY-MM-DD
        allowNull: false
      },
      status: { // 'success' hoặc 'failed'
        type: Sequelize.STRING,
        allowNull: false
      },
      executed_at: { // Thời điểm thực sự job được chạy
        type: Sequelize.DATE,
        allowNull: false
      },
      error_message: { // Lưu thông điệp lỗi nếu status là 'failed'
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
    // Thêm index để tăng tốc độ query
    await queryInterface.addIndex('JobExecutionLogs', ['job_name', 'run_date', 'status']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('JobExecutionLogs');
  }
};