// src/models/task.js
'use strict'

const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Task extends Model{
        static associate(models){
            Task.belongsTo(models.User, {
                foreignKey: 'created_by',
                as: 'createdBy'
            }),
            Task.hasMany(models.TaskPet, {
                foreignKey: 'task_id',
                as: 'task'
            })
        }
    }

    Task.init({
        // id: id của công việc, khóa chính, tự tăng
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        // name: tên của công việc
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        // time: thời điểm
        time: {
            type: DataTypes.STRING,
            allowNull: false
        },
        // hour: thời gian
        hour: {
            type: DataTypes.DATE,
            allowNull: false
        },
        // frequency: tần suất
        frequency: {
            type: DataTypes.ENUM('everyday', 'one_time_day', 'two_times_day', 'three_times_day', 'everyweek', 'one_time_week', 'two_times_week', 'three_times_week', 'everymonth', 'others'),
            allowNull: false
        },
        // other_frequency: tần suất khác
        other_frequency: {
            type: DataTypes.STRING,
            allowNull: true
        },
        // required_note: yêu cầu,
        required_note: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        // created_by: người tạo
        created_by: {
            type: DataTypes.UUID,
            allowNull: false
        },
        // status: trạng thái của công việc
        status: {
            type: DataTypes.ENUM('pending', 'in_progress', 'completed'),
            defaultValue: 'pending'
        },
        // is_updated_image: cập nhật trạng thái đã upload ảnh chưa
        is_updated_image: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        sequelize,
        modelName: 'Task'
    });
    return Task;
}