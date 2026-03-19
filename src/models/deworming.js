// src/models/deworming.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Deworming extends Model {
        static associate (models) {
            Deworming.belongsTo(models.Pet, {
                foreignKey: 'pet_id',
                as: 'deworming'
            })
        }
    };

    Deworming.init({
        //id: id của tẩy giun, tự sinh, là khóa chính
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
        // medication_name: tên thuốc
        medication_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        // dosage: liều lượng
        dosage: {
            type: DataTypes.STRING,
            allowNull: false
        },
        // deworming_date: ngày tẩy giun
        deworming_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        // next_deworming_date: ngày tẩy lại
        next_deworming_date: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'Deworming'
    });

    return Deworming
}