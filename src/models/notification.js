// src/models/notification.js
'use strict';

const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Notification extends Model{
        static associate(models){
            // Người nhận thông báo (người chụp ảnh)
            Notification.belongsTo(models.User, {
                foreignKey: 'recipient_id',
                as: 'recipient'
            }),
            // Người tạo ra hành động gây thông báo (quản lý xóa ảnh)
            Notification.belongsTo(models.User, {
                foreignKey: 'sender_id',
                as: 'sender'
            }),
            // Công việc liên quan tới thông báo
            Notification.belongsTo(models.Task, {
                foreignKey: 'task_id',
                as: 'task'
            })
        }
    };

    Notification.init({
        // id: id của thông báo, khóa chính
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        // recipient_id: người nhận thông báo (người chụp ảnh bị xóa)
        recipient_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        // sender_id: người gây ra thông báo (quản lý)
        sender_id: {
            type: DataTypes.UUID,
            allowNull: true
        },
        // task_id: công việc liên quan
        task_id: {
            type: DataTypes.UUID,
            allowNull: true
        },
        // type: loại thông báo
        type: {
            type: DataTypes.ENUM('image_deleted'),
            allowNull: false,
            defaultValue: 'image_deleted'
        },
        // title: tiêu đề thông báo
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        // message: nội dung thông báo
        message: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        // reason: lý do (ví dụ: lý do quản lý xóa ảnh)
        reason: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        // metadata: thông tin bổ sung (tên ảnh, url ảnh, tên công việc...)
        metadata: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        // is_read: đã đọc hay chưa
        is_read: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        sequelize,
        modelName: 'Notification'
    });
    return Notification;
}
