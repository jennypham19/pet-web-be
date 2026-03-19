// src/models/vaccination.js
'use strict'

const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Vaccination extends Model{
        static associate(models){
            Vaccination.belongsTo(models.Pet, {
                foreignKey: 'pet_id',
                as: 'vaccination'
            })
        }
    };

    Vaccination.init({
        //id: id của vắc xin, tự sinh, là khóa chính
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        // pet_id: id của thú cưng, là khóa ngoại liên kết với bảng Pet
        pet_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        // medication_name: tên thuốc
        medication_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        // first_dose_date: ngày bắt đầu tiêm
        first_dose_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        // booster_date: ngày tiêm nhắc lại
        booster_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        // adverse_reaction: kết quả phản ứng
        adverse_reaction: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Vaccination'
    });
    return Vaccination;
}