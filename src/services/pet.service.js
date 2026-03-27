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
                    pet_id: petDB.id, name_image: image.nameImage, url_image: image.urlImage
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

// Lấy chi tiết hồ sơ thú cưng
const queryPet= async(id) => {
    try {
        const petDB = await Pet.findOne({
            where: { id },
            include:[
                {
                    model: HealthPet,
                    as: 'petHealth'
                },
                {
                    model: Vaccination,
                    as: 'petVaccination'
                },
                {
                    model: Deworming,
                    as: 'petDeworming'
                },
                {
                    model: RegularVetCheckup,
                    as: 'petRegularVetCheckup'
                },
                {
                    model: SpecialNutritionalPlan,
                    as: 'petSpecialNutritionalPlan'
                },
                {
                    model: PetImage,
                    as: 'petImages'
                }
            ],
            order: [[ 'createdAt', 'DESC' ]]
        });

        if (!petDB) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy thú cưng");
        }
        const newPet = petDB.toJSON();
        const pet = {
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
            urlAvatar: newPet.url_avatar,
            petHealth: newPet.petHealth ? {
                id: newPet.petHealth.id,
                clinicName: newPet.petHealth.clinic_name,
                address: newPet.petHealth.address,
                phone: newPet.petHealth.phone,
                attendingVet: newPet.petHealth.attending_vet,
                createdAt: newPet.petHealth.createdAt,
                updatedAt: newPet.petHealth.updatedAt
            } : null,
            petVaccination: newPet.petVaccination ? {
                id: newPet.petVaccination.id,
                medicationName: newPet.petVaccination.medication_name,
                firstDoseDate: newPet.petVaccination.first_dose_date,
                boosterDate: newPet.petVaccination.booster_date,
                adverseReaction: newPet.petVaccination.adverse_reaction,
                createdAt: newPet.petVaccination.createdAt,
                updatedAt: newPet.petVaccination.updatedAt
            } : null,
            petDeworming: newPet.petDeworming ? {
                id: newPet.petDeworming.id,
                medicationName: newPet.petDeworming.medication_name,
                dosage: newPet.petDeworming.dosage,
                dewormingDate: newPet.petDeworming.deworming_date,
                nextDewormingDate: newPet.petDeworming.next_deworming_date,
                createdAt: newPet.petDeworming.createdAt,
                updatedAt: newPet.petDeworming.updatedAt
            } : null,
            petRegularVetCheckup: newPet.petRegularVetCheckup && !isEmptyObject(newPet.petRegularVetCheckup) ? {
                id: newPet.petRegularVetCheckup.id,
                examinationDate: newPet.petRegularVetCheckup.examination_date,
                recheckDate: newPet.petRegularVetCheckup.recheck_date,
                healthCondition: newPet.petRegularVetCheckup.health_condition,
                conclusion: newPet.petRegularVetCheckup.conclusion,
                createdAt: newPet.petRegularVetCheckup.createdAt,
                updatedAt: newPet.petRegularVetCheckup.updatedAt
            } : null,
            petSpecialNutritionalPlan: newPet.petSpecialNutritionalPlan &&  !isEmptyObject(newPet.petSpecialNutritionalPlan) ? {
                id: newPet.petSpecialNutritionalPlan.id,
                food: newPet.petSpecialNutritionalPlan.food,
                amount: newPet.petSpecialNutritionalPlan.amount,
                frequency: newPet.petSpecialNutritionalPlan.frequency,
                nutritionalSupplements: newPet.petSpecialNutritionalPlan.nutritional_supplements,
                createdAt: newPet.petSpecialNutritionalPlan.createdAt,
                updatedAt: newPet.petSpecialNutritionalPlan.updatedAt
            } : null,
            petImages: (newPet.petImages ?? [])
                .map((el) => {
                    return{
                        id: el.id,
                        nameImage: el.name_image,
                        urlImage: el.url_image,
                        createdAt: el.createdAt,
                        updatedAt: el.updatedAt
                    }
                })
        }
        return pet
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Đã có lỗi xảy ra: " + error.message)
    }
}
module.exports = {
    createPet,
    queryListPets,
    queryPet
}