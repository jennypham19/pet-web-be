// src/models/task-pet.js
'use strict'

const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class TaskPet extends Model{
        static associate(models){
            TaskPet.belongsTo(models.Task, {
                foreignKey: 'task_id',
                as: 'taskPet'
            }),
            TaskPet.belongsTo(models.Pet, {
                foreignKey: 'pet_id',
                as: 'petsTask'
            })
        }
    };

    TaskPet.init({
        // id: id của task-pet, khóa chính
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        // task_id: id của Task, khóa phụ
        task_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        // pet_id: id của Pet, khóa phụ
        pet_id: {
            type: DataTypes.UUID,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'TaskPet'
    });
    return TaskPet;
}