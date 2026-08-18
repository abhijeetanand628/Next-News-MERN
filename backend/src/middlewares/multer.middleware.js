import multer from "multer";

import fs from "fs";

const tempDir = "./public/temp";
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        // Save files temporarily to the public/temp folder
        cb(null, tempDir)
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }
})

export const upload = multer({
    storage,
})