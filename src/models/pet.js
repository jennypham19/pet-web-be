// src/models/pet.js
'use strict'

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Pet extends Model {
        static associate(models){
            Pet.hasOne(models.HealthPet, {
                foreignKey: 'pet_id',
                as: 'petHealth'
            }),
            Pet.hasOne(models.Vaccination, {
                foreignKey: 'pet_id',
                as: 'petVaccination'
            }),
            Pet.hasOne(models.Deworming, {
                foreignKey: 'pet_id',
                as: 'petDeworming'
            }),
            Pet.hasOne(models.RegularVetCheckup, {
                foreignKey: 'pet_id',
                as: 'petRegularVetCheckup'
            }),
            Pet.hasOne(models.SpecialNutritionalPlan, {
                foreignKey: 'pet_id',
                as: 'petSpecialNutritionalPlan'
            })
        }
    };

    Pet.init({
        //id: id của thú cưng, tự sinh, là khóa chính
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        // name: tên của thú cưng
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        // sex: giới tính
        sex: {
            type: DataTypes.ENUM('female', 'male'),
            allowNull: false
        },
        // dob: ngày sinh của thú cưng
        dob: {
            type: DataTypes.DATE,
            allowNull: true
        },
        // species: loài
        species: {
            type: DataTypes.STRING,
            allowNull: false
        },
        // type: động vật
        type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        // breeding_staus: tình trạng sinh sản của thú cưng
        breeding_staus:{
            type: DataTypes.TEXT,
            allowNull: false
        } 
    }, {
        sequelize,
        modelName: 'Pet'
    });
    return Pet;
}