import path from "path";
import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads");
  },
  filename: function (req, file, cb) {
    req.body.thumbnail =
      req.user.email + Date.now() + path.extname(file.originalname);
    cb(null, req.user.email + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

export default upload;
