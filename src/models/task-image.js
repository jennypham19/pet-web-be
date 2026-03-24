// src/models/task-image.js
'use strict';

const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class TaskImage extends Model{
        static associate(models){
            TaskImage.belongsTo(models.Task, {
                foreignKey: 'task_id',
                as: 'imagesTask'
            }),
            TaskImage.belongsTo(models.User, {
                foreignKey: 'uploaded_by',
                as: 'uploadedBy'
            })
        }
    };

    TaskImage.init({
        // id: id của taskImage, khóa chính
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        // task_id: id của Task, khóa phụ
        task_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        // name_image: tên của ảnh
        name_image: {
            type: DataTypes.STRING,
            allowNull: false
        },
        // url_image: đường link của ảnh
        url_image: {
            type: DataTypes.STRING,
            allowNull: false
        },
        // uploaded_date: ngày giờ chụp ảnh
        uploaded_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        // uploaded_by: người chụp
        uploaded_by: {
            type: DataTypes.UUID,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'TaskImage'
    });
    return TaskImage
}