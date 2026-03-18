// src/services/user.service.js
const { User } = require('../models');
const { StatusCodes } = require('http-status-codes');
const ApiError = require('../utils/ApiError');
const bcrypt = require('bcryptjs');

// Lấy chi tiết user theo id
const getUserById = async(id) => {
    const user = await User.findByPk(id);
    if(!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Không tồn tại người dùng. ');
    };
    return user;
}

// Kiểm tra xem có tồn tại account không
const isAccountTaken = async(account) => {
    const user = await User.findOne({ where: { account }});
    return !!user;
}

// Tạo tài khoản nhân sự
const createAccount = async(accountBody) => {
    try {
        const { name, account, password, role } = accountBody;
        if(await isAccountTaken(account)){
            throw new ApiError(StatusCodes.BAD_REQUEST, "Tài khoản đã tồn tại.");
        }

        // Hash bằng bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name, account, password: hashedPassword, role
        });
        user.password = undefined; // Không trả về password
        return user;
    } catch (error) {
        if(error instanceof ApiError) throw error;
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Đã có lỗi xảy ra. ' + error.message)
    }
}

module.exports = {
    createAccount,
}