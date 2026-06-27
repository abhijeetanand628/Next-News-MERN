import multer from "multer";

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        // Save files temporarily to the public/temp folder
        cb(null, "./public/temp")
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }
})

export const upload = multer({
    storage,
})