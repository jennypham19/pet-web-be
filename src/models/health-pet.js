// src/models/health-pet.js
'use strict';

const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class HealthPet extends Model{
        static associate(models){
            HealthPet.belongsTo(models.Pet, {
                foreignKey: 'pet_id',
                as: 'healthPet'
            })
        }
    };

    HealthPet.init({
        //id: id của y tế thú cưng, tự sinh, là khóa chính
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        // pet_id: id của thú cưng, khóa ngoại, liên kết đến bảng Pet
        pet_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        // clinic_name: tên phòng khám
        clinic_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        // address: địa chỉ phòng khám
        address: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        // phone: số điện thoại của phòng khám
        phone: {
            type: DataTypes.STRING,
            allowNull: false
        },
        // attending_vet: bác sĩ điều trị
        attending_vet: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'HealthPet'
    });
    return HealthPet;
}