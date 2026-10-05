// src/validations/notification.validation.js
const Joi = require('joi');

const getNotifications = {
    query: Joi.object().keys({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(20)
    })
};

const markAsRead = {
    params: Joi.object().keys({
        id: Joi.string().required()
    })
};

module.exports = {
    getNotifications,
    markAsRead
};
