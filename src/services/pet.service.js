// src/services/pet.service.js
const { Pet, sequelize, HealthPet, Vaccination, Deworming, RegularVetCheckup, SpecialNutritionalPlan, PetImage } = require('../models');
const { StatusCodes } = require('http-status-codes');
const ApiError = require('../utils/ApiError');
const { Op } = require('sequelize');
const { isEmptyObject } = require('../utils/common')

// Tạo hồ sơ thú cưng
const createPet = async(petBody) => {
    const transaction = await sequelize.transaction();
    try {
        const { pet, health, vaccination, deworming, checkup, nutrition, images } = petBody;
        const { name, sex, dob, type, species, breedingStatus, urlAvatar, nameAvatar } = pet;
        const { clinicName, address, phone, attendingVet } = health;
        const { medicationNameVac, firstDoseDate, boosterDate, adverseReaction } = vaccination;
        const { medicationName, dosage, dewormingDate, nextDewormingDate } = deworming;
        
        const petDB = await Pet.create({
            name, sex, dob, type, species, breeding_staus: breedingStatus, url_avatar: urlAvatar, name_avatar: nameAvatar
        }, { transaction })

        await HealthPet.create({
            pet_id: petDB.id, clinic_name: clinicName, address, phone, attending_vet: attendingVet
        }, { transaction })

        await Vaccination.create({
            pet_id: petDB.id,
            medication_name: medicationNameVac,
            first_dose_date: firstDoseDate,
            booster_date: boosterDate,
            adverse_reaction: adverseReaction
        }, { transaction })

        await Deworming.create({
            pet_id: petDB.id,
            medication_name: medicationName,
            dosage,
            deworming_date: dewormingDate,
            next_deworming_date: nextDewormingDate
        }, { transaction })

        if(checkup && !isEmptyObject(checkup)){
            await RegularVetCheckup.create({
                pet_id: petDB.id,
                examination_date: checkup.examinationDate,
                recheck_date: checkup.recheckDate,
                health_condition: checkup.healthCondition,
                conclusion: checkup.conclusion
            }, { transaction })
        }

        if(nutrition && !isEmptyObject(nutrition)){
            await SpecialNutritionalPlan.create({
                pet_id: petDB.id,
                food: nutrition.food,
                amount: nutrition.amount,
                frequency: nutrition.frequency,
                nutritional_supplements: nutrition.nutritionalSupplements
            }, { transaction })
        }

        if(images.length > 0){
            for(const image of images){
                await PetImage.create({
                    pet_id: petDB.id, name_image: image.nameImage, url_image: urlImage
                }, { transaction })                
            }
        }
        await transaction.commit()
    } catch (error) {
        await transaction.rollback()
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
            whereClause.name =  { [Op.iLike]: `%${searchTerm}%` }
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