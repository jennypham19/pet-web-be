// src/services/auth.service.js
const { User, Token } = require('../models');
const bcrypt = require('bcryptjs');
const { StatusCodes } = require('http-status-codes');
const ApiError = require('../utils/ApiError');

// Đăng nhập
const login = async(account, password) => {
    try {
        const userDB = await User.findOne({
            where: { account }
        })
        if(!userDB || !(await bcrypt.compare(password, userDB.password))) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, 'Tên đăng nhập hoặc mật khẩu không chính xác');
        }
        if(userDB.is_active === 0) {
            throw new ApiError(StatusCodes.FORBIDDEN, 'Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên');
        }

        const newUser = userDB.toJSON();
        const user = {
                id: newUser.id,
                name: newUser.name,
                account: newUser.account,
                password: newUser.password,
                gender: newUser.gender,
                position: newUser.position,
                title: newUser.title,
                dob: newUser.date_of_birth,
                cccd: newUser.cccd,
                email: newUser.email,
                phone: newUser.phone,
                address: newUser.address,
                isActived: newUser.is_actived,
                isDefaultType: newUser.is_default_type,
                isReset: newUser.is_reset,
                isDeleted: newUser.is_deleted,
                avatarUrl: newUser.avatar_url,
                role: newUser.role,
                createdAt: newUser.createdAt,
                updatedAt: newUser.updatedAt
            
        };

        return user;
    } catch (error) {
        if(error instanceof ApiError) throw error;
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Server error during login process. ' + error.message)
    }
}

// Đăng xuất
const logout = async(refreshToken) => {
    const refreshTokenDoc = await Token.findOne({ where: { token: refreshToken, type: 'refresh' }});
    if(!refreshTokenDoc){
        throw new ApiError(StatusCodes.NOT_FOUND, "Refresh token không tồn tại.")
    };

    await refreshTokenDoc.destroy();
}

// Lây thông tin cá nhân
const getCurrentMe = async(id) => {
    try {
        const userDB = await User.findByPk(id, { attributes: { exclude: ['password'] }});
        if(!userDB){
            throw new ApiError(StatusCodes.NOT_FOUND, "Người dùng không tồn tại")
        }
        const newUser = userDB.toJSON();
        const user = {
            id: newUser.id,
            name: newUser.name,
            account: newUser.account,
            password: newUser.password,
            gender: newUser.gender,
            position: newUser.position,
            title: newUser.title,
            dob: newUser.dob,
            cccd: newUser.cccd,
            email: newUser.email,
            phone: newUser.phone,
            address: newUser.address,
            isActived: newUser.is_actived,
            isDefaultType: newUser.is_default_type,
            isReset: newUser.is_reset,
            isDeleted: newUser.is_deleted,
            avatarUrl: newUser.avatar_url,
            role: newUser.role,
            createdAt: newUser.createdAt,
            updatedAt: newUser.updatedAt 
        }
        return user
    } catch (error) {
        if(error instanceof ApiError) throw error;
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Đã có lỗi xảy ra: " + error.message)
    }
}

module.exports = {
    login,
    logout,
    getCurrentMe
}