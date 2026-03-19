//src/routes/pet.route.js
const express = require('express');

const { protect, authorize } = require('../middlewares/auth');
const petController = require('../controllers/pet.controller');
const petValidation = require('../validations/pet.validation');
const baseValidation = require('../validations/base.validation');
const validate = require('../middlewares/validate');

const router = express.Router();

router.use(protect, authorize('mod', 'specialist'));

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

module.exports = router;