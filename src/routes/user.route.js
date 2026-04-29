//src/routes/user.route.js
const express = require('express');

const { protect, authorize } = require('../middlewares/auth');
const userController = require('../controllers/user.controller');
const userValidation = require('../validations/user.validation');
const baseValidation = require('../validations/base.validation');
const validate = require('../middlewares/validate');

const router = express.Router();

router.use(protect, authorize('admin', 'mod', 'specialist', 'employee'));

// Lấy chi tiết tài khoản
router.get(
    '/user-account-detail/:id',
    validate(baseValidation.queryOption),
    userController.getAccount
)

// Cập nhật hồ sơ
router.put(
    '/profile-user-updated/:id',
    validate(userValidation.updateProfile),
    userController.updateProfile
)

// Thay đổi mật khẩu
router.put(
    '/account-password-changed/:id',
    validate(userValidation.changePassword),
    userController.changePassword
)

router.use(protect, authorize('admin'));

// tạo tài khoản nhân sự
router.post(
    '/user-account-created',
    validate(userValidation.createAccount),
    userController.createAccount
)

// Lấy danh sách tài khoản
router.get(
    '/user-accounts-list',
    validate(baseValidation.queryOptions),
    userController.getListAccounts
)

// Lấy danh sách tất cả tài khoản
router.get(
    '/user-accounts',
    validate(baseValidation.queryOptions),
    userController.getAccounts
)

// Vô hiệu hóa tài khoản
router.patch(
    '/user-account-disabled/:id',
    validate(baseValidation.queryOption),
    userController.deactivateAccount
)
// Kích hoạt tài khoản
router.patch(
    '/user-account-activated/:id',
    validate(baseValidation.queryOption),
    userController.activateAccount
)

// Thay đổi vai trò
router.patch(
    '/account-role-changed/:id',
    validate(userValidation.changeRole),
    userController.changeRole
)

// Reset mật khẩu
router.patch(
    '/user-password-reset/:id',
    validate(baseValidation.queryOption),
    userController.resetPassword
)

module.exports = router;