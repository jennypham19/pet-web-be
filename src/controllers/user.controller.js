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

// Lấy danh sách tài khoản
const getListAccounts = catchAsync(async(req, res) => {
    const queryOptions = pick(req.query, ['page', 'limit', 'searchTerm']);
    const users = await userService.queryAccounts(queryOptions);
    res.status(StatusCodes.OK).send({ success: true, message: 'Lấy danh sách tài khoản thành công.', data: users})
})

// Lấy chi tiết tài khoản
const getAccount = catchAsync(async(req, res) => {
    const user = await userService.getAccount(req.params.id);
    res.status(StatusCodes.OK).send({ success: true, message: 'Lấy chi tiết tài khoản thành công.', data: user})
})

module.exports = {
    createAccount,
    getListAccounts,
    getAccount
}