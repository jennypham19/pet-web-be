//src/routes/upload.route.js
const express = require('express');
const { protect, authorize } = require('../middlewares/auth');
const { upload, uploadAndSign, uploadBulkAndSign} = require('../middlewares/upload');
const uploadController = require('../controllers/upload.controller');
const checkFileSize = require("../middlewares/checkFileSize");

const router = express.Router();

router.use(protect, authorize('employee', 'admin', 'mod', 'specialist'));

//upload ảnh
router.post(
    '/upload-image',
    upload.single('image'),
    checkFileSize.checkFileSize,
    uploadController.uploadImageSingle
)

// upload nhiều ảnh
router.post(
    '/upload-images', 
    upload.array('images', 10), 
    checkFileSize.checkFilesSize,
    uploadController.uploadEmployeeImageMultiple
);

// upload nhiều video
router.post(
    '/upload-videos', 
    upload.array('videos', 5), 
    checkFileSize.checkFilesSize,
    uploadController.uploadEmployeeImageMultiple
);

// upload nhiều files (ảnh, PDF, DOC, DOCX)
router.post(
    '/upload-files', 
    uploadBulkAndSign('files', 10), 
    checkFileSize.checkFilesSize,
    uploadController.uploadFiles
);
module.exports = router;