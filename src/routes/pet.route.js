//src/routes/pet.route.js
const express = require('express');

const { protect, authorize } = require('../middlewares/auth');
const petController = require('../controllers/pet.controller');
const petValidation = require('../validations/pet.validation');
const baseValidation = require('../validations/base.validation');
const validate = require('../middlewares/validate');

const router = express.Router();

router.use(protect, authorize('mod', 'specialist', 'employee'));

// tạo tài khoản nhân sự
router.post(
    '/pet-profile-created',
    validate(petValidation.createPet),
    petController.createPet
)

// Lấy danh sách
router.get(
    '/pets-list',
    validate(baseValidation.queryOptions),
    petController.getListPets
)

// Lấy chi tiết hồ sơ thú cưng
router.get(
    '/detail-pet/:id',
    validate(baseValidation.queryOption),
    petController.getPet
)

// Lấy danh sách hình ảnh của hồ sơ thú cưng
router.get(
    '/list-pet-images',
    validate(baseValidation.queryOptions),
    petController.queryListPetImages
)

// Cập nhật hình ảnh của hồ sơ thú cưng
router.post(
    '/pet-images-add',
    validate(petValidation.uploadPetImage),
    petController.updatePetImage
)

module.exports = router;