// src/controllers/user.controller.js

const { StatusCodes } = require('http-status-codes');
const catchAsync = require('../utils/catchAsync');
const userService = require('../services/user.service.js');
const pick = require('../utils/pick');

// Tạo tài khoản nhân sự
const createAccount = catchAsync(async (req, res) => {
    const user = await userService.createAccount(req.body);
    res.status(StatusCodes.CREATED).send({ success: true, message: 'Tạo tài khoản nhân sự thành công', data: user });
})

module.exports = {
    createAccount,
}