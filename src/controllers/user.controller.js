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

// Lấy danh sách tất cả tài khoản
const getAccounts = catchAsync(async(req, res) => {
    const queryOptions = pick(req.query, ['page', 'limit', 'searchTerm']);
    const users = await userService.queryListAccounts(queryOptions);
    res.status(StatusCodes.OK).send({ success: true, message: 'Lấy danh sách tài khoản thành công.', data: users})
})

// Lấy chi tiết tài khoản
const getAccount = catchAsync(async(req, res) => {
    const user = await userService.getAccount(req.params.id);
    res.status(StatusCodes.OK).send({ success: true, message: 'Lấy chi tiết tài khoản thành công.', data: user})
})

// Cập nhật hồ sơ
const updateProfile = catchAsync(async(req, res) => {
    const user = await userService.updateProfile(req.params.id, req.body);
    res.status(StatusCodes.OK).send({ success: true, message: 'Cập nhật hồ sơ người dùng thành công. ', data: user })
})

// Vô hiệu hóa tài khoản
const deactivateAccount = catchAsync(async(req, res) => {
    await userService.deactivateAccount(req.params.id);
    res.status(StatusCodes.OK).send({ success: true, message: 'Vô hiệu hóa tài khoản thành công.' })
})

// Kích hoạt tài khoản
const activateAccount = catchAsync(async(req, res) => {
    await userService.activateAccount(req.params.id);
    res.status(StatusCodes.OK).send({ success: true, message: 'Kích hoạt tài khoản thành công.' })
})

// thay đổi mật khẩu
const changePassword = catchAsync(async(req, res) => {
    await userService.changePassword(req.params.id, req.body);
    res.status(StatusCodes.OK).send({ success: true, message: 'Thay đổi mật khẩu thành công'})
})

// thay đổi vai trò
const changeRole = catchAsync(async(req, res) => {
    await userService.changeRoleAccount(req.params.id, req.body);
    res.status(StatusCodes.OK).send({ success: true, message: 'Thay đổi vai trò thành công'})
})

// reset mật khẩu
const resetPassword = catchAsync(async(req, res) => {
    const user = await userService.resetPasswordAccount(req.params.id);
    res.status(StatusCodes.OK).send({ success: true, message: 'Reset mật khẩu thành công', data: user})
})

module.exports = {
    createAccount,
    getListAccounts,
    getAccount,
    updateProfile,
    deactivateAccount,
    activateAccount,
    getAccounts,
    changePassword,
    changeRole,
    resetPassword
}