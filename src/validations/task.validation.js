// src/validation/task.validation.js

const Joi = require('joi');

const createTask = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        petIds: Joi.array().required(),
        time: Joi.string().required(),
        hour: Joi.string().required(),
        frequency: Joi.string().required(),
        otherFrequency: Joi.string().allow('', null),
        requiredNote: Joi.string().required(),
        createdBy: Joi.string().required()
    })
}

const updateStatus = {
    params: Joi.object().keys({
        id: Joi.string().required()
    }),
    body: Joi.object().keys({
        status: Joi.string().required()
    })
}
module.exports = {
    createTask,
    updateStatus
}