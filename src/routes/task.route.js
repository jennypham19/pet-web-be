//src/routes/task.route.js
const express = require('express');

const { protect, authorize } = require('../middlewares/auth');
const taskController = require('../controllers/task.controller');
const taskValidation = require('../validations/task.validation');
const baseValidation = require('../validations/base.validation');
const validate = require('../middlewares/validate');

const router = express.Router();

router.use(protect, authorize('mod', 'specialist'));

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

// Cập nhật trạng thái
router.patch(
    '/status-updated/:id',
    validate(taskValidation.updateStatus),
    taskController.updateStatus
)

module.exports = router;