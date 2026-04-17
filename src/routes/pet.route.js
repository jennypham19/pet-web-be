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

// Lấy danh sách lịch tiêm phòng
router.get(
    '/vaccinations-pet',
    validate(petValidation.petInfoQuery),
    petController.getVaccinations
)

// Lấy danh sách lịch tẩy giun
router.get(
    '/dewormings-pet',
    validate(petValidation.petInfoQuery),
    petController.getDewormings
)

// Lấy danh sách lịch khám định kỳ
router.get(
    '/regular-vet-checkups-pet',
    validate(petValidation.petInfoQuery),
    petController.getRegularVetCheckups
)

// Thêm lịch tiêm phòng
router.post(
    '/pet-vaccination-add',
    validate(petValidation.addVaccinationPet),
    petController.addVaccination
)

// Thêm lịch tẩy giun
router.post(
    '/pet-deworming-add',
    validate(petValidation.addDewormingPet),
    petController.addDeworming
)

// Thêm hồ sơ khám định kỳ thành công
router.post(
    '/pet-regular-vet-checkup-add',
    validate(petValidation.addRegularVetCheckupPet),
    petController.addRegularVetCheckup
)

module.exports = router;