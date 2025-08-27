const multer = require("multer")
const path = require("path")


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/customer/")
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  },
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "application/pdf") {
    cb(null, true)
  } else {
    cb(new Error("Unsupported file format"), false)
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
})

// Multer fields for multiple file uploads
const uploadFields = upload.fields([
  { name: "id_proof1", maxCount: 1 },
  { name: "id_proof2", maxCount: 1 },
  { name: "photo", maxCount: 1 },
  { name: "company_proof", maxCount: 1 },
  { name: "customer_agreement_form", maxCount: 1 },
  { name: "purchase_order", maxCount: 1 },
])

module.exports = uploadFields
