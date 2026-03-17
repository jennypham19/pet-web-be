// src/controller/auth.controller
const { StatusCodes } = require('http-status-codes');
const catchAsync = require('../utils/catchAsync');
const authService = require('../services/auth.service');
const tokenService = require('../services/token.service');
const config = require('../config');
const ApiError = require('../utils/ApiError');

// Đăng nhập
const login = catchAsync(async (req, res) => {
    const { account, password } = req.body;
    const user = await authService.login(account, password);
    const tokens = await tokenService.generateAuthTokens(user);

    // Gửi refreshToken qua cookie httpOnly để tăng cường bảo mật
    res.cookie('refreshToken', tokens.refreshToken.token, {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: 'None',
        maxAge: config.jwt.refreshExpirationDays * 24 * 60 * 60 * 1000, // maxAge tính bằng mili giây
    });

    // Xóa mật khẩu trước khi gửi vể client
    user.password = undefined;

    // Trả về response đúng như cấu trúc FE cần
    res.status(StatusCodes.OK).send({
        success: true,
        message: 'Đăng nhập thành công',
        data: {
            user,
            accessToken: tokens.accessToken.token,
            refreshToken: tokens.refreshToken.token,
        }
    })
})

// Đăng xuất
const logout = catchAsync(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if(refreshToken) {
        await authService.logout(refreshToken);
    }
    res.clearCookie('refreshToken');
    res.status(StatusCodes.NO_CONTENT).send();
})

// Refresh token
const refreshToken = catchAsync(async (req, res) => {
  const oldRefreshToken = req.cookies.refreshToken;
  if (!oldRefreshToken) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Không tìm thấy refresh token');
  }

  const newTokens = await tokenService.refreshAuth(oldRefreshToken);

  res.cookie('refreshToken', newTokens.refreshToken.token, {
    httpOnly: true,
    secure: config.env === 'production',
    maxAge: config.jwt.refreshExpirationDays * 24 * 60 * 60 * 1000,
  });

  // Chỉ trả về access token mới
  res.status(StatusCodes.OK).send({
    success: true,
    data: {
      accessToken: newTokens.accessToken.token,
    },
  });
});

// Lấy thông chi tiết hiện tại
const getCurrentMe = catchAsync(async (req, res) => {
  // req.user đã có từ middleware protect
  const user = await authService.getCurrentMe(req.user.id);
  res.status(StatusCodes.OK).send({ success: true, data: user })
})

module.exports = {
    login,
    logout,
    refreshToken,
    getCurrentMe
}