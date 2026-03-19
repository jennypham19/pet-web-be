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
        })

    })
}

module.exports = {
    createPet
}