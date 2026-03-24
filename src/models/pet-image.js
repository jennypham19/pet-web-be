//src/models/pet-image.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class PetImage extends Model {
        static associate(models){
            PetImage.belongsTo(models.Pet, {
                foreignKey: 'pet_id',
                as: 'imagesPet'
            })
        }
    };

    PetImage.init({
        // id: id của pet-image, khóa chính
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        // pet_id: id của pet, khóa phụ
        pet_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        // name_image: tên ảnh
        name_image: {
            type: DataTypes.STRING,
            allowNull: false
        },
        // url_image: đường link của ảnh
        url_image: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'PetImage'
    });
    return PetImage
}