// src/middlewares/checkFileSize.js
const ApiError = require("../utils/ApiError");
const { StatusCodes } = require("http-status-codes");

// Middleware kiểm tra dung lượng file trước khi upload
const checkFilesSize = (req, res, next) => {
  // Nếu không có file nào
  if (!req.files || req.files.length === 0) {
    return next();
  }
    const allowedDocs  = [
      'application/pdf',
      'application/postscript',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];

    const allowedRaw = [
      "application/zip",
      "application/x-rar-compressed",
      "text/plain",
      "application/json",
      "text/csv",
      "application/xml",
      "text/xml",
      "image/svg+xml",
      "image/*"
    ];

  for (const file of req.files) {
    if (file.mimetype.startsWith("image")) {
      if (file.size > 5 * 1024 * 1024) {
        return next(
          new ApiError(StatusCodes.BAD_REQUEST, "Ảnh vượt quá dung lượng 5MB!")
        );
      }
    } else if (file.mimetype.startsWith("video")) {
      if (file.size > 100 * 1024 * 1024) {
        return next(
          new ApiError(StatusCodes.BAD_REQUEST, "Video vượt quá dung lượng 100MB!")
        );
      }
    } else if (allowedRaw.includes(file.mimetype)) {
      if (file.size > 10 * 1024 * 1024) {
        return next(
          new ApiError(
            StatusCodes.BAD_REQUEST,
            "File PDF vượt quá dung lượng 10MB!"
          ),
          false
        );
      }
    } else if (allowedDocs.includes(file.mimetype)) {
      if (file.size > 10 * 1024 * 1024) {
        return next(
          new ApiError(
            StatusCodes.BAD_REQUEST,
            "File DOC, DOCX vượt quá dung lượng 10MB!"
          ),
          false
        );
      }
    } else {
      return next(
        new ApiError(
          StatusCodes.BAD_REQUEST,
          "Chỉ cho phép upload file ảnh, PDF, DOC, DOCX hoặc video!"
        )
      );
    }
  }

  next();
};

// Middleware kiểm tra dung lượng file trước khi upload
const checkFileSize = (req, res, next) => {
  // Nếu không có file nào
  if (!req.file) {
    return next();
  }
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
  const file = req.file;

    if (file.mimetype.startsWith("image")) {
      if (file.size > 5 * 1024 * 1024) {
        return next(
          new ApiError(StatusCodes.BAD_REQUEST, "Ảnh vượt quá dung lượng 5MB!")
        );
      }
    } else if (file.mimetype.startsWith("video")) {
      if (file.size > 500 * 1024 * 1024) {
        return next(
          new ApiError(StatusCodes.BAD_REQUEST, "Video vượt quá dung lượng 500MB!")
        );
      }
    } else if (allowedTypes.includes(file.mimetype)) {
      if (file.size > 10 * 1024 * 1024) {
        return next(
          new ApiError(
            StatusCodes.BAD_REQUEST,
            "File PDF, DOC, DOCX vượt quá dung lượng 10MB!"
          ),
          false
        );
      }
    } else {
      return next(
        new ApiError(
          StatusCodes.BAD_REQUEST,
          "Chỉ cho phép upload file ảnh hoặc video!"
        )
      );
    }

  next();
};

module.exports = {
    checkFilesSize,
    checkFileSize
};
