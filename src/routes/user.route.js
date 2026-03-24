//src/routes/user.route.js
const express = require('express');

const { protect, authorize } = require('../middlewares/auth');
const userController = require('../controllers/user.controller');
const userValidation = require('../validations/user.validation');
const baseValidation = require('../validations/base.validation');
const validate = require('../middlewares/validate');

const router = express.Router();

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

router.use(protect, authorize('admin', 'mod', 'specialist', 'employee'));

module.exports = router;