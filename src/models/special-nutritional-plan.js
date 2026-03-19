// src/models/special-nutritional-plan.js
'use strict'

const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class SpecialNutritionalPlan extends Model {
        static associate(models){
            SpecialNutritionalPlan.belongsTo(models.Pet, {
                foreignKey: 'pet_id',
                as: 'specialNutritionalPlan'
            })
        }
    };

    SpecialNutritionalPlan.init({
        //id: id của chế độ dinh dưỡng đặc biệt, tự sinh, là khóa chính
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        // pet_id: id của thú cưng, là khóa ngoại liên kết bảng Pet
        pet_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        // food: thức ăn
        food: {
            type: DataTypes.STRING,
            allowNull: false
        },
        // amount: số lượng
        amount: {
            type: DataTypes.STRING,
            allowNull: false
        },
        // frequency: tần suất
        frequency: {
            type: DataTypes.STRING,
            allowNull: true
        },
        // nutritional_supplements: bổ sung thêm dinh dưỡng
        nutritional_supplements: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'SpecialNutritionalPlan'
    });

    return SpecialNutritionalPlan
}