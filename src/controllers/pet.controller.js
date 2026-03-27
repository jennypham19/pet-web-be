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

module.exports = {
    createPet,
    getListPets,
    getPet
}