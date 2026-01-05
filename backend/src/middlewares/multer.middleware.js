import multer from "multer";
import fs from "fs";

// // ensure folder exists
// const dir = "./public/temp";
// if (!fs.existsSync(dir)) {
//   fs.mkdirSync(dir, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, dir);
//   },
//   filename: function (req, file, cb) {
//     // replace spaces to avoid issues
//     const safeName = file.originalname.replace(/\s+/g, "_");
//     cb(null, `${Date.now()}_${safeName}`);
//   },
// });

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

/*
Summary
This entire script creates an upload middleware ready for use in your Express routes. When a file is uploaded, this middleware:

Checks and ensures the ./public/temp folder exists.

Saves the file to that folder (destination: dir).

Renames the file to prevent conflicts and ensure uniqueness using a timestamp and a cleaned-up original name (filename: ...).

Enforces a 20MB file size limit.
*/
