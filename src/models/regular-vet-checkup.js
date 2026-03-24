// src/models/regular-vet-checkup.js
'use strict';

const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class RegularVetCheckup extends Model {
        static associate(models){
            RegularVetCheckup.belongsTo(models.Pet, {
                foreignKey: 'pet_id',
                as: 'regularVetCheckup'
            })
        }
    };

    RegularVetCheckup.init({
        //id: id của khám định kỳ, tự sinh, là khóa chính
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
        // examination_date: ngày khám
        examination_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        // recheck_date: ngày khám lại
        recheck_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        // health_condition: tình trạng sức khỏe
        health_condition: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        // conclusion: kết luận
        conclusion: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'RegularVetCheckup'
    });

    return RegularVetCheckup
}