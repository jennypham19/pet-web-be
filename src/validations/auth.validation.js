const Joi = require('joi');

const login = {
    body: Joi.object().keys({
        account: Joi.string().required(),
        password: Joi.string().required()
    })
}

module.exports = {
    login
}