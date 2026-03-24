// src/controllers/task.controller.js
const { StatusCodes } = require('http-status-codes');
const catchAsync = require('../utils/catchAsync');
const taskService = require('../services/task.service.js')
const pick = require('../utils/pick');

// tạo công việc
const createTask = catchAsync(async(req, res) => {
    await taskService.createTask(req.body);
    res.status(StatusCodes.CREATED).send({ success: true, message: 'Tạo mới công việc thành công' });
})

// Lấy danh sách công việc
const getListTasks = catchAsync(async(req, res) => {
    const queryOptions = pick(req.query, ['page', 'limit', 'searchTerm']);
    const tasks = await taskService.queryTasks(queryOptions);
    res.status(StatusCodes.OK).send({ success: true, message: 'Lấy danh sách thành công', data: tasks})
})

// Cập nhật trạng thái
const updateStatus = catchAsync(async(req, res) => {
    await taskService.updatedStatus(req.params.id, req.body);
    res.status(StatusCodes.OK).send({ success: true, message: 'Cập nhật trạng thái công việc thành công'})
})

// Cập nhật hình ảnh cho công việc
const updateImagesForTask = catchAsync(async(req, res) => {
    await taskService.updateImagesForTask(req.params.id, req.body);
    res.status(StatusCodes.OK).send({ success: true, message: 'Cập nhật hình ảnh công việc thành công'})
})

// Lấy chi tiết công việc
const getTask = catchAsync(async(req, res) => {
    const task = await taskService.queryTask(req.params.id);
    res.status(StatusCodes.OK).send({ success: true, message: 'Lấy danh sách thành công', data: task})
})

module.exports = {
    createTask,
    getListTasks,
    updateStatus,
    updateImagesForTask,
    getTask
}