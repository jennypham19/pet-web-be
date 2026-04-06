const Joi = require('joi');

const createPet = {
    body: Joi.object().keys({
        pet: Joi.object({
            name: Joi.string().required(),
            sex: Joi.string().required(),
            dob: Joi.string().allow('', null),
            type: Joi.string().required(),
            species: Joi.string().required(),
            breedingStatus: Joi.string().required(),
            urlAvatar: Joi.string().required(),
            nameAvatar: Joi.string().required(),
        }),
        health: Joi.object({
            clinicName: Joi.string().required(),
            address: Joi.string().required(),
            phone: Joi.string().required(),
            attendingVet: Joi.string().required()
        }),
        vaccination: Joi.object({
            medicationNameVac: Joi.string().required(),
            firstDoseDate: Joi.string().required(),
            boosterDate: Joi.string().required(),
            adverseReaction: Joi.string().required()
        }),
        deworming: Joi.object({
            medicationName: Joi.string().required(),
            dosage: Joi.string().required(),
            dewormingDate: Joi.string().required(),
            nextDewormingDate: Joi.string().required()
        }),
        checkup: Joi.object({
            examinationDate: Joi.string().optional().allow('', null),
            recheckDate: Joi.string().optional().allow('', null),
            healthCondition: Joi.string().optional().allow('', null),
            conclusion: Joi.string().optional().allow('', null)
        }).allow('', null),
        nutrition: Joi.object({
            food: Joi.string().optional().allow('', null),
            amount: Joi.string().optional().allow('', null),
            frequency: Joi.string().optional().allow('', null),
            nutritionalSupplements: Joi.string().optional().allow('', null)
        }).allow('', null),
        images: Joi.array().optional()
    })
}

const uploadPetImage = {
    body: Joi.object().keys({
        imagePets: Joi.array().items({
            petId: Joi.string().required(),
            urlImage: Joi.string().required(),
            nameImage: Joi.string().required()
        })
    })
}

module.exports = {
    createPet,
    uploadPetImage
}