import express, { ErrorRequestHandler } from 'express';
import uploadController from '../controllers/uploadController.js';
import { MulterError } from 'multer';
import CustomMulterError from '../errors/CustomMulterError.js';
import multer from 'multer';
import auth from '../middlewares/auth.js';
import fs from 'node:fs';
import { Buffer } from 'node:buffer';
import mime from 'mime-types';
import type {} from 'multer';

const uploadRouter = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const buf = Buffer.from(file.originalname, 'latin1');
    const originalname = buf.toString('utf-8');
    let name = originalname.split('.')[0];
    (file as any).downloadName = originalname;
    const extension = mime.extension(file.mimetype);
    name = `${name}_${Date.now()}.${extension}`;
    (file as any).name = name;
    cb(null, name);
  },
});
const MB_10 = 10 * 1024 * 1024;
const upload = multer({ storage, limits: { fileSize: MB_10 } });

uploadRouter.param('folderId', (req, res, next) => {
  req.folderId = req.params.folderId;
  next();
});

uploadRouter.get('/:folderId', uploadController.upload_get);
uploadRouter.post(
  '/:folderId',
  auth.isAuth,
  upload.array('files', 5),
  uploadController.upload_post,
);

const uploadErrHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.log(err);
  if (err instanceof MulterError) {
    const multerErr = new CustomMulterError(err.code);
    return res.status(multerErr.statusCode).render('pages/uploadForm', {
      folderId: req.folderId,
      title: 'Upload',
      failed_upload_msg: multerErr.msg,
    });
  }
  next(err);
};
uploadRouter.use(uploadErrHandler);

export default uploadRouter;
