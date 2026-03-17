const jwt = require('jsonwebtoken');
const moment = require('moment');
const { StatusCodes } = require('http-status-codes');
const config = require('../config');
const { Token, User } = require('../models');
const { tokenTypes } = require('../config/token');
const ApiError = require('../utils/ApiError');

// Tạo token
const generateToken = (userId, role, secret, expiresIn) => {
    const payload = {
        sub: userId,
        role: role,
        iat: Math.floor(Date.now() / 1000),
    };
    return jwt.sign(payload, secret, { expiresIn });
}

// Lưu token
const saveToken = async (token, userId, expires, type, blacklisted = false ) => {
    const createdToken = await Token.create({
        token,
        user_id: userId,
        expires: expires.toDate(),
        type,
        blacklisted
    });
    return createdToken;
}

// Xác minh token
const verifyToken = async (token, type) => {
    const secret = type === tokenTypes.REFRESH ? config.jwt.refreshSecret : config.jwt.secret;
    try {
        const payload = jwt.verify(token, secret);
        const tokenDoc = await Token.findOne({
            where: { token, type, user_id: payload.sub, blacklisted: false },
        });
        if(!tokenDoc) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Token not found in DB');
        }
        return tokenDoc;
    } catch (error) {
        if(error instanceof ApiError) throw error;
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Token is not valid');
    }
};

// Tạo token auth
const generateAuthTokens = async (user) => {
    const accessTokenExpiresIn = `${config.jwt.accessExpirationMinutes}m`;
    const refreshTokenExpiresIn = `${config.jwt.refreshExpirationDays}d`;
    
    const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
    const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');

    const accessToken = generateToken(user.id, user.role, config.jwt.secret, accessTokenExpiresIn);
    const refreshToken = generateToken(user.id, user.role, config.jwt.secret, refreshTokenExpiresIn);

    // Lưu refresh token vào database
    await saveToken(refreshToken, user.id, refreshTokenExpires, tokenTypes.REFRESH);

    return {
        accessToken: { token: accessToken, expires: accessTokenExpires.toDate() },
        refreshToken: { token: refreshToken, expires: refreshTokenExpires.toDate() },
    }
}

/**
 * Làm mới access token bằng refresh token
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */

const refreshAuth = async (refreshToken) => {
    try {
        const refreshTokenDoc = await verifyToken(refreshToken, tokenTypes.REFRESH);
        const user = await User.findByPk(refreshTokenDoc.user_id);
        if (!user) {
            throw new ApiError('User not found');
        }

        // Xóa refresh token cũ đi để đảm bảo mỗi refresh token chỉ được dùng một lần (tăng bảo mật)
        await refreshTokenDoc.destroy();
        // Tạo cặp token mới
        return await generateAuthTokens(user);
    } catch (error) {
        if(error instanceof ApiError) throw error;
        // Nếu verifyToken hoặc bất cứ thứ gì khác thất bại
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Please authenticate')
    }
};

const blacklistRefreshToken = async (refreshToken) => {
    const tokenDoc = await Token.findOne({
        where: {
            token: refreshToken,
            type: tokenTypes.REFRESH
        }
    });
    if (!tokenDoc) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Refresh token not found');
    }
    tokenDoc.blacklisted = true;
    await tokenDoc.save();
    return tokenDoc;
}

module.exports = {
    generateToken,
    saveToken,
    verifyToken,
    generateAuthTokens,
    refreshAuth,
    blacklistRefreshToken
}