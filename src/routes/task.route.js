//src/routes/task.route.js
const express = require('express');

const { protect, authorize } = require('../middlewares/auth');
const taskController = require('../controllers/task.controller');
const taskValidation = require('../validations/task.validation');
const baseValidation = require('../validations/base.validation');
const validate = require('../middlewares/validate');

const router = express.Router();

router.use(protect, authorize('mod', 'specialist', 'employee'));

// tạo công việc 
router.post(
    '/task-created',
    validate(taskValidation.createTask),
    taskController.createTask
)

// Lấy danh sách công việc
router.get(
    '/list-tasks',
    validate(baseValidation.queryOptions),
    taskController.getListTasks
)

// Lấy danh sách công việc cho chuyên viên
router.get(
    '/list-tasks-for-specialist',
    validate(baseValidation.queryOptions),
    taskController.getListTasksForSpecialist
)

// Cập nhật trạng thái
router.patch(
    '/status-updated/:id',
    validate(taskValidation.updateStatus),
    taskController.updateStatus
)

// Cập nhật hình ảnh công việc
router.put(
    '/images-task-uploaded/:id',
    validate(taskValidation.updateImagesForTask),
    taskController.updateImagesForTask
)

// Lấy chi tiết công việc
router.get(
    '/detail-task/:id',
    validate(baseValidation.queryOption),
    taskController.getTask
)

// Xóa công việc
router.delete(
    '/task-deleted/:id',
    validate(baseValidation.queryOption),
    taskController.deleteTask
)

// lấy tổng công việc, công việc ngày hôm nay, tổng nhân sự (chuyên viên + nhân viên đang hoạt động)
router.get(
    '/total-task-and-staff',
    taskController.getTotalTaskAndStaff
)

module.exports = router;