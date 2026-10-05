'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Notifications', {
        // id: id của thông báo, khóa chính
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.literal('gen_random_uuid()'),
            allowNull: false,
            primaryKey: true
        },
        // recipient_id: người nhận thông báo (người chụp ảnh bị xóa)
        recipient_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
                model: 'Users', key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        // sender_id: người gây ra thông báo (quản lý)
        sender_id: {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: 'Users', key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        },
        // task_id: công việc liên quan
        task_id: {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: 'Tasks', key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        },
        // type: loại thông báo
        type: {
            type: Sequelize.ENUM('image_deleted'),
            allowNull: false,
            defaultValue: 'image_deleted'
        },
        // title: tiêu đề thông báo
        title: {
            type: Sequelize.STRING,
            allowNull: false
        },
        // message: nội dung thông báo
        message: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        // reason: lý do (ví dụ: lý do quản lý xóa ảnh)
        reason: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        // metadata: thông tin bổ sung
        metadata: {
            type: Sequelize.JSONB,
            allowNull: true
        },
        // is_read: đã đọc hay chưa
        is_read: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false
        },
        updatedAt: {
            type: Sequelize.DATE,
            allowNull: false
        }
    });

    await queryInterface.addIndex('Notifications', ['recipient_id']);
    await queryInterface.addIndex('Notifications', ['recipient_id', 'is_read']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Notifications');
    // Xóa ENUM type do Postgres tạo ra để migration có thể chạy lại
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Notifications_type";');
  }
};
