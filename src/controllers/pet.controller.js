// src/controllers/pet.controller.js

const { StatusCodes } = require('http-status-codes');
const catchAsync = require('../utils/catchAsync');
const petService = require('../services/pet.service.js')
const pick = require('../utils/pick');

// Tạo hồ sơ thú cưng
const createPet = catchAsync(async (req, res) => {
    await petService.createPet(req.body);
    res.status(StatusCodes.CREATED).send({ success: true, message: 'Tạo hồ sơ thú cưng thành công' });
})

// Lấy danh sách hồ sơ thú cưng
const getListPets = catchAsync(async (req, res) => {
    const queryOptions = pick(req.query, ['page', 'limit', 'searchTerm']);
    const pets = await petService.queryListPets(queryOptions);
    res.status(StatusCodes.OK).send({ success: true, message: 'Lấy danh sách thành công', data: pets})
})

// Lấy chi tiết hồ sơ thú cưng
const getPet = catchAsync(async (req, res) => {
    const pet = await petService.queryPet(req.params.id);
    res.status(StatusCodes.OK).send({ success: true, message: 'Lấy chi tiết hồ sơ thú cưng thành công.', data: pet})
})

// Lấy danh sách hình ảnh của hồ sơ thú cưng
const queryListPetImages = catchAsync(async (req, res) => {
    const imagesPet = pick(req.query, ['page', 'limit']);
    const petImages = await petService.queryListPetImages(imagesPet);
    res.status(StatusCodes.OK).send({ success: true, message: 'Lấy danh sách hình ảnh của hồ sơ thú cưng thành công.', data: petImages})
})

// Cập nhật hình ảnh của hồ sơ thú cưng
const updatePetImage = catchAsync(async (req, res) => {
    await petService.updatePetImage(req.body);
    res.status(StatusCodes.OK).send({ success: true, message: 'Cập nhật hình ảnh của hồ sơ thú cưng thành công.'})
})

// Lấy danh sách lịch tiêm phòng
const getVaccinations = catchAsync(async (req, res) => {
    const queryOptions = pick(req.query, ['id', 'page', 'limit', 'searchTerm']);
    const vacs = await petService.getVaccinations(queryOptions);
    res.status(StatusCodes.OK).send({ success: true, message: 'Lấy danh sách thông tin lịch tiêm phòng thành công. ', data: vacs})
})

// Lấy danh sách lịch tẩy giun
const getDewormings = catchAsync(async (req, res) => {
    const queryOptions = pick(req.query, ['id', 'page', 'limit', 'searchTerm']);
    const vacs = await petService.getDewormings(queryOptions);
    res.status(StatusCodes.OK).send({ success: true, message: 'Lấy danh sách thông tin lịch tẩy giun thành công. ', data: vacs})
})

// Lấy danh sách lịch khám định kỳ
const getRegularVetCheckups = catchAsync(async (req, res) => {
    const queryOptions = pick(req.query, ['id', 'page', 'limit', 'searchTerm']);
    const vacs = await petService.getRegularVetCheckups(queryOptions);
    res.status(StatusCodes.OK).send({ success: true, message: 'Lấy danh sách thông tin khám định kỳ thành công. ', data: vacs})
})

// Thêm lịch tiêm phòng
const addVaccination = catchAsync(async (req, res) => {
    await petService.addPetVaccination(req.body);
    res.status(StatusCodes.OK).send({ success: true, message: 'Thêm lịch tiêm phòng thành công'})
})

// Thêm lịch tẩy giun
const addDeworming = catchAsync(async (req, res) => {
    await petService.addPetDeworming(req.body);
    res.status(StatusCodes.OK).send({ success: true, message: 'Thêm lịch tẩy giun thành công'})
})

// Thêm khám định kỳ
const addRegularVetCheckup = catchAsync(async (req, res) => {
    await petService.addPetRegularVetCheckup(req.body);
    res.status(StatusCodes.OK).send({ success: true, message: 'Thêm hồ sơ khám định kỳ thành công'})
})

module.exports = {
    createPet,
    getListPets,
    getPet,
    queryListPetImages,
    updatePetImage,
    addVaccination,
    getVaccinations,
    getDewormings,
    getRegularVetCheckups,
    addDeworming,
    addRegularVetCheckup
}