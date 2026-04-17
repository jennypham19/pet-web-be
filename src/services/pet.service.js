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
            petHealth: newPet.petHealth && !isEmptyObject(newPet.petHealth) ? {
                id: newPet.petHealth.id,
                clinicName: newPet.petHealth.clinic_name ? newPet.petHealth.clinic_name : null,
                address: newPet.petHealth.address ? newPet.petHealth.address : null,
                phone: newPet.petHealth.phone ? newPet.petHealth.phone :  null,
                attendingVet: newPet.petHealth.attending_vet ? newPet.petHealth.attending_vet : null,
                createdAt: newPet.petHealth.createdAt,
                updatedAt: newPet.petHealth.updatedAt
            } : null,
            petVaccination: newPet.petVaccination ? newPet.petVaccination.map((vac) => {
                return {
                    id: vac.id,
                    medicationName: vac.medication_name,
                    firstDoseDate: vac.first_dose_date,
                    boosterDate: vac.booster_date,
                    adverseReaction: vac.adverse_reaction,
                    createdAt: vac.createdAt,
                    updatedAt: vac.updatedAt
                }
            }) : [],
            petDeworming: newPet.petDeworming ? newPet.petDeworming.map((dew) => {
                return {
                    id: dew.id,
                    medicationName: dew.medication_name,
                    dosage: dew.dosage,
                    dewormingDate: dew.deworming_date,
                    nextDewormingDate: dew.next_deworming_date,
                    createdAt: dew.createdAt,
                    updatedAt: dew.updatedAt
                }
            }) : [],
            petRegularVetCheckup: (newPet.petRegularVetCheckup ?? []).map((checkUp) => {
                    return {
                        id: checkUp.id,
                        examinationDate: checkUp.examination_date,
                        recheckDate: checkUp.recheck_date,
                        healthCondition: checkUp.health_condition,
                        conclusion: checkUp.conclusion,
                        createdAt: checkUp.createdAt,
                        updatedAt: checkUp.updatedAt
                }
            }),
            // petRegularVetCheckup: newPet.petRegularVetCheckup && !isEmptyObject(newPet.petRegularVetCheckup) ? {
            //     id: newPet.petRegularVetCheckup.id,
            //     examinationDate: newPet.petRegularVetCheckup.examination_date,
            //     recheckDate: newPet.petRegularVetCheckup.recheck_date,
            //     healthCondition: newPet.petRegularVetCheckup.health_condition,
            //     conclusion: newPet.petRegularVetCheckup.conclusion,
            //     createdAt: newPet.petRegularVetCheckup.createdAt,
            //     updatedAt: newPet.petRegularVetCheckup.updatedAt
            // } : null,
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

// Lấy danh sách hình ảnh thú cưng
// Lấy danh sách hồ sơ thú cưng
const queryListPetImages= async(queryOptions) => {
    try {
        const page = Number(queryOptions.page) || 1;
        const limit = Number(queryOptions.limit) || 10;
        const offset = (page - 1) * limit;
        const { count, rows: imagesDB } = await PetImage.findAndCountAll({
            limit,
            offset,
            order: [[ 'createdAt', 'DESC' ]]
        });
        const totalPages = Math.ceil(count/limit);
        const images = imagesDB.map((image) => {
            const newImage = image.toJSON();
            return {
                id: newImage.id,
                nameImage: newImage.name_image,
                urlImage: newImage.url_image,
                createdAt: newImage.createdAt,
                updatedAt: newImage.updatedAt
            }
        })
        return {
            data: images,
            totalPages,
            currentPage: page,
            total: count
        }
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Đã có lỗi xảy ra: " + error.message)
    }
}

// Cập nhật hình ảnh hồ sơ thú cưng
const updatePetImage = async(imagePetBody) => {
    try {
        const { imagePets } = imagePetBody;
        for(const imagePet of imagePets){
            const { petId, urlImage, nameImage } = imagePet;
            await PetImage.create({
                pet_id: petId, name_image: nameImage, url_image: urlImage
            })
        }
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Đã có lỗi xảy ra: " + error.message)
    }
}

// Lấy danh sách lịch tiêm phòng
const getVaccinations = async(queryOptions) => {
    try {
        const { id, page, limit, searchTerm } = queryOptions;
        const offset = (page - 1) * limit;
        const whereClause = { pet_id: id };
        if(searchTerm){
            whereClause.medication_name =  { [Op.iLike]: `%${searchTerm}%` }
        }
        const { count, rows: vacsDB } = await Vaccination.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [[ 'createdAt', 'DESC' ]]
        });
        const totalPages = Math.ceil(count/limit);
        const vacs = vacsDB.map((vac) => {
            const newVac = vac.toJSON();
            return {
                id: newVac.id,
                medicationName: newVac.medication_name,
                firstDoseDate: newVac.first_dose_date,
                boosterDate: newVac.boosterDate,
                createdAt: newVac.createdAt,
                updatedAt: newVac.updatedAt,
            }
        })
        return {
            data: vacs,
            totalPages,
            currentPage: page,
            total: count
        }
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Đã có lỗi xảy ra: " + error.message)
    }
}

// Lấy danh sách lịch tẩy giun
const getDewormings = async(queryOptions) => {
    try {
        const { id, page, limit, searchTerm } = queryOptions;
        const offset = (page - 1) * limit;
        const whereClause = { pet_id: id };
        if(searchTerm){
            whereClause.medication_name =  { [Op.iLike]: `%${searchTerm}%` }
        }
        const { count, rows: dewsDB } = await Deworming.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [[ 'createdAt', 'DESC' ]]
        });
        const totalPages = Math.ceil(count/limit);
        const dews = dewsDB.map((dew) => {
            const newDew = dew.toJSON();
            return {
                id: newDew.id,
                medicationName: newDew.medication_name,
                dosage: newDew.dosage,
                dewormingDate: newDew.deworming_date,
                nextDewormingDate: newDew.next_deworming_date,
                createdAt: newDew.createdAt,
                updatedAt: newDew.updatedAt,
            }
        })
        return {
            data: dews,
            totalPages,
            currentPage: page,
            total: count
        }
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Đã có lỗi xảy ra: " + error.message)
    }
}
// Lấy danh sách lịch khám định kỳ
const getRegularVetCheckups = async(queryOptions) => {
    try {
        const { id, page, limit, searchTerm } = queryOptions;
        const offset = (page - 1) * limit;
        const whereClause = { pet_id: id };
        if(searchTerm){
            whereClause.health_condition =  { [Op.iLike]: `%${searchTerm}%` }
        }
        const { count, rows: checkUpsDB } = await RegularVetCheckup.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [[ 'createdAt', 'DESC' ]]
        });
        const totalPages = Math.ceil(count/limit);
        const checkUps = checkUpsDB.map((checkUp) => {
            const newcheckUp = checkUp.toJSON();
            return {
                id: newcheckUp.id,
                examinationDate: newcheckUp.examination_date,
                recheckDate: newcheckUp.recheck_date,
                healthCondition: newcheckUp.health_condition,
                conclusion: newcheckUp.conclusion,
                createdAt: newcheckUp.createdAt,
                updatedAt: newcheckUp.updatedAt,
            }
        })
        return {
            data: checkUps,
            totalPages,
            currentPage: page,
            total: count
        }
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Đã có lỗi xảy ra: " + error.message)
    }
}

// Thêm lịch tiêm phòng
const addPetVaccination = async(vacBody) => {
    try {
        const { idPet, medicationName, firstDoseDate, boosterDate, adverseReaction } = vacBody;
        await Vaccination.create({
            pet_id: idPet,
            medication_name: medicationName,
            first_dose_date: firstDoseDate,
            booster_date: boosterDate,
            adverse_reaction: adverseReaction
        })
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Đã có lỗi xảy ra: " + error.message)
    }
}

// Thêm lịch tẩy giun
const addPetDeworming = async(dewBody) => {
    try {
        const { idPet, medicationName, dosage, dewormingDate, nextDewormingDate } = dewBody;
        await Deworming.create({
            pet_id: idPet,
            medication_name: medicationName,
            dosage: dosage,
            deworming_date: dewormingDate,
            next_deworming_date: nextDewormingDate
        })
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Đã có lỗi xảy ra: " + error.message)
    }
}

// Thêm khám định kỳ
const addPetRegularVetCheckup = async(checkupBody) => {
    try {
        const { idPet, examinationDate, recheckDate, healthCondition, conclusion } = checkupBody;
        await RegularVetCheckup.create({
            pet_id: idPet,
            examination_date: examinationDate,
            recheck_date: recheckDate,
            health_condition: healthCondition,
            conclusion: conclusion
        })
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Đã có lỗi xảy ra: " + error.message)
    }
}


module.exports = {
    createPet,
    queryListPetImages,
    queryListPets,
    queryPet,
    updatePetImage,
    addPetVaccination,
    getVaccinations,
    getDewormings,
    getRegularVetCheckups,
    addPetDeworming,
    addPetRegularVetCheckup
}