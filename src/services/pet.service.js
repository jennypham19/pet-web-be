// src/services/pet.service.js
const { Pet } = require('../models');
const { StatusCodes } = require('http-status-codes');
const ApiError = require('../utils/ApiError');

// Tạo hồ sơ thú cưng
const createPet = async(petBody) => {
    try {
        const { name, sex, dob, type, species, breedingStatus, urlAvatar, nameAvatar } = petBody.pet;
        await Pet.create({
            name, sex, dob, type, species, breeding_staus: breedingStatus, url_avatar: urlAvatar, name_avatar: nameAvatar
        })
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Đã có lỗi xảy ra: " + error.message);
    }
}

// Lấy danh sách hồ sơ thú cưng
const queryListPets= async(queryOptions) => {
    try {
        const { page, limit, searchTerm } = queryOptions;
        const offset = (page - 1) * limit;
        const whereClause = {};
        if(searchTerm){
            whereClause[Op.or] = [
                { name: { [Op.iLike]: `%${searchTerm}%` }},
            ]
        }
        const { count, rows: petDB } = await Pet.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [[ 'createdAt', 'DESC' ]]
        });
        const totalPages = Math.ceil(count/limit);
        const pets = petDB.map((pet) => {
            const newPet = pet.toJSON();
            return {
                id: newPet.id,
                name: newPet.name,
                sex: newPet.sex,
                dob: newPet.dob,
                species: newPet.species,
                type: newPet.type,
                breedingStatus: newPet.breeding_staus,
                createdAt: newPet.createdAt,
                updatedAt: newPet.updatedAt,
                nameAvatar: newPet.name_avatar,
                urlAvatar: newPet.url_avatar
            }
        })
        return {
            data: pets,
            totalPages,
            currentPage: page,
            total: count
        }
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Đã có lỗi xảy ra: " + error.message)
    }
}

module.exports = {
    createPet,
    queryListPets
}