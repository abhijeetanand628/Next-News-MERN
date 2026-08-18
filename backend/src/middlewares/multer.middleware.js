import multer from "multer";

import os from "os";

const tempDir = os.tmpdir();

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        // Save files temporarily to the OS temp folder
        cb(null, tempDir)
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }
})

export const upload = multer({
    storage,
})