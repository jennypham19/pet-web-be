const Joi = require('joi');

const createAccount = {
    body: Joi.object().keys({
        name: Joi.string().required().messages({
            'string.empty': 'Họ tên không được để trống',
            'any.required': 'Họ tên là trường bắt buộc'
        }),
        account: Joi.string().required().messages({
            'string.empty': 'Tài khoản không được để trống',
            'any.required': 'Tài khoản là trường bắt buộc'
        }),
        password: Joi.string().required().messages({
            'string.empty': 'Mật khẩu không được để trống',
            'any.required': 'Mật khẩu là trường bắt buộc'
        }),
        role: Joi.string().required().messages({
            'string.empty': 'Vai trò không được để trống',
            'any.required': 'Vai trò là trường bắt buộc'
        }),
    })
}

const updateProfile = {
    params: Joi.object().keys({
        id: Joi.string().required()
    }),
    body: Joi.object().keys({
        avatarUrl: Joi.string().required(),
        name: Joi.string().required(),
        gender: Joi.string().required(),
        dob: Joi.string().required(),
        cccd: Joi.string().required(),
        position: Joi.string().required(),
        title: Joi.string().required(),
        email: Joi.string().required(),
        phone: Joi.string().required(),
        address: Joi.string().required(),
        professionalBiography: Joi.string().allow('', null)
    })
}

module.exports = {
    createAccount,
    updateProfile
}