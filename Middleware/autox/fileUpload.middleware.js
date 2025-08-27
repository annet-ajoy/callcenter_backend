const fs = require("fs");
const multer = require("multer");
const path = require("path");
const { ApiError } = require("../../utils/autox/ApiError.js");
const { asyncHandler } = require("../../utils/autox/asyncHandler.js");

const allowedMimeTypes = {
  // Images
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'image/svg+xml': 'image',
  // Videos
  'video/mp4': 'video',
  'video/webm': 'video',
  'video/quicktime': 'video',
  // Audio
  'audio/mpeg': 'audio',
  'audio/wav': 'audio',
  'audio/ogg': 'audio',
  // Documents
  'application/pdf': 'doc',
  'application/msword': 'doc', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'doc', // .docx
  'application/vnd.ms-excel': 'doc', // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'doc', // .xlsx
  'application/vnd.ms-powerpoint': 'doc', // .ppt
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'doc', // .pptx
  'text/plain': 'doc', // .txt
  'application/rtf': 'doc', // .rtf
};


const fileUpload = (
  folder = "/assets",
  maxAttachments = 15,
) => {
  // const up_folder = `${process.env.FILE_PATH}${folder}`
  const up_folder = path.join(__dirname, `../../public${folder}`);


  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      if (!fs.existsSync(up_folder)) {
        fs.mkdirSync(up_folder, { recursive: true });
      }
      cb(null, up_folder);
    },
    filename: (req, file, cb) => {

      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, ext);

      let imageName = ((baseName || file.fieldname) + "-" + uniqueSuffix + ext );

      cb(null, imageName );
    },
  });

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 10 * 1024 * 1024,
      files: maxAttachments,
    },
    fileFilter: (req, file, cb) => {
      if (
        file.mimetype.startsWith("image/") ||
        file.mimetype.startsWith("video/") ||
        file.mimetype.startsWith("audio/") ||
        'application/pdf' ||
        'application/msword'
      ) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    },
  });

  return asyncHandler((req, res, next) => {
    return new Promise((resolve, reject) => {
      upload.any()(req, res, (err) => {
        if (err) {
          console.log(err);
          return reject(new ApiError(500, "Error uploading file"));
        }

        if (!req.files || req.files.length === 0) {
          return resolve(next());
        }

        
        req.uploadedFiles = req.files.map((file) => {

          return {
            file: file,
            fileUrl: `${req.protocol}://${req.get("host")}${folder}/${file.filename}`,
            localPath: path.join(up_folder, file.filename),
            fileType: allowedMimeTypes[file.mimetype],
            fileName: file.filename,           
          }
        });

        resolve(next());
      });
    });
  });
};

module.exports = { fileUpload };
