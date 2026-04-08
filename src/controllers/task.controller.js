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

// Lấy danh sách công việc cho chuyên viên
const getListTasksForSpecialist = catchAsync(async(req, res) => {
    const queryOptions = pick(req.query, ['page', 'limit', 'searchTerm']);
    const tasks = await taskService.queryTasksForSpecialist(queryOptions);
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

// Thực hiện rollover tasks hàng ngày
const runRolloverTasksController = catchAsync(async(req, res) => {
    const today = new Date().toISOString().split('T')[0]; // Lấy ngày hiện tại theo định dạng YYYY-MM-DD;
    const result = await taskService.rolloverOrRecreateTasksForToday(today);
    res.status(StatusCodes.OK).send({ success: true, message: 'Thực hiện rollover tasks thành công', data: result });
});

// Xóa các công việc cũ đã hoàn thành hơn 30 ngày
const runDeleteOldTasksController = catchAsync(async(req, res) => {
    const result = await taskService.deleteOldTasks(30);
    res.status(StatusCodes.OK).send({ success: true, message: 'Xóa công việc cũ thành công', data: result });
})

// Xóa công việc
const deleteTask = catchAsync(async(req, res) => {
    await taskService.deleteTask(req.params.id);
    res.status(StatusCodes.OK).send({ success: true, message: 'Xóa công việc thành công' });
})

module.exports = {
    createTask,
    getListTasks,
    updateStatus,
    updateImagesForTask,
    getTask,
    runRolloverTasksController,
    runDeleteOldTasksController,
    getListTasksForSpecialist,
    deleteTask
}