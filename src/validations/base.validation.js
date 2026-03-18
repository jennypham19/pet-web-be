const Joi = require('joi');

const queryOptions = {
    query: Joi.object().keys({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        searchTerm: Joi.string().optional(),
        status: Joi.string().optional(),
    })
}

const queryOption = {
    params: Joi.object().keys({
        id: Joi.string().required()
    })
}

module.exports = {
    queryOptions,
    queryOption
}