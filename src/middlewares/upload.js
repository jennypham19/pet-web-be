// src/middlewares/upload.js
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const path = require('path');
const ApiError = require('../utils/ApiError');
const { StatusCodes } = require('http-status-codes');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { v4: uuidv4 } = require("uuid");
const crypto = require('crypto');

const getCloudinaryResourceType = (mimetype) => {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  return "raw";
};

// Signed URL đúng chuẩn: folder/public_id.format
const signCloudinaryUrl = (publicId) => {
  return cloudinary.url(publicId, {
    resource_type: "raw",
    type: "authenticated",
    sign_url: true,
    secure: true
  });
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    let folder = "wooden";
    if (req.body.type) {
      folder = `${folder}/${req.body.type}`;
    }

    const correctName = Buffer.from(file.originalname, "latin1").toString("utf8");
    
    let ext = path.extname(file.originalname).toLowerCase().replace(".", "");
    if(ext === 'jfif'){
      ext = 'jpg'
    }
    // const baseName = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9-_]/g, "_");
    const baseName = path.parse(correctName).name;
    
    const fileHash = crypto.createHash("md5").update(baseName).digest("hex");

    // const publicId = `${baseName}_${fileHash}`; // ⚠ KHÔNG có .pdf
    const publicId = baseName; // ⚠ KHÔNG có .pdf
    const resourceType = getCloudinaryResourceType(file.mimetype);

    return {
      folder,
      resource_type: resourceType,
      type: resourceType === "raw" ? "authenticated" : "upload",
      public_id: publicId,
      format: ext, // chuẩn Cloudinary
      overwrite: false,
      use_filename: true, // giữ tên gốc của file
      unique_filename: false, // không thêm chuỗi random vào
    };
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedDocs = [
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

    // Lấy extension để check thêm (cho .xxml)
    const ext = file.originalname.split(".").pop().toLowerCase();

    //Hỗ trợ file.xxml
    const allowedExtensions = ["xxml"];

    if (file.mimetype.startsWith("image/")) return cb(null, true);
    if (file.mimetype.startsWith("video/")) return cb(null, true);
    if (allowedDocs.includes(file.mimetype)) return cb(null, true);
    if (allowedRaw.includes(file.mimetype)) return cb(null, true);

    // Check extension nếu MIME rỗng hoặc không khớp
    if (ext && allowedExtensions.includes(ext)) {
      return cb(null, true);
    }

    return cb(
      new ApiError(
        StatusCodes.BAD_REQUEST,
        "Chỉ cho phép upload ảnh, video, PDF, DOC, DOCX, ZIP, TXT, XML, XXML!"
      ),
      false
    );
  },
});

// ----------------- Upload nhiều file -----------------
const uploadBulkAndSign = (fieldName, maxCount = 10) => (req, res, next) => {
  upload.array(fieldName, maxCount)(req, res, async (err) => {
    if (err) return next(err);
    if (!req.files || req.files.length === 0)
      return next(new ApiError(StatusCodes.BAD_REQUEST, "Không có file"));

    req.uploadedFiles = req.files.map(file => {
      const isRaw = getCloudinaryResourceType(file.mimetype) === "raw";

      let signedUrl = file.path;
      if (isRaw) {
        signedUrl = signCloudinaryUrl(file.filename);
      }
      return {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        public_id: file.public_id,
        folder: file.folder,
        format: file.format,
        url: signedUrl,
        filename: file.filename
      };
    });

    next();
  });
};

// ----------------- Upload 1 file -----------------
const uploadAndSign = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, function (err) {
    if (err) return next(err);
    if (!req.file)
      return next(new ApiError(StatusCodes.BAD_REQUEST, "Thiếu file"));

    const isRaw = getCloudinaryResourceType(req.file.mimetype) === "raw";

    let signedUrl = req.file.path;
    if (isRaw) {
      signedUrl = signCloudinaryUrl(req.file.filename);
    }

    req.uploadedFile = {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      public_id: req.file.public_id,
      folder: req.file.folder,
      format: req.file.format,
      url: signedUrl,
      filename: req.file.filename
    };

    next();
  });
};

module.exports = {
  uploadAndSign,
  uploadBulkAndSign,
  upload
};
