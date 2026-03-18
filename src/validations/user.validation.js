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

module.exports = {
    createAccount,
}