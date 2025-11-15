import express from 'express';
import uploadController from '../controllers/uploadController.js';
import { MulterError } from 'multer';
import CustomMulterError from '../errors/CustomMulterError.js';

const uploadRouter = express.Router();

uploadRouter.param('folderId', (req, res, next) => {
  req.folderId = req.params.folderId;
  next();
});

uploadRouter.get('/:folderId', uploadController.upload_get);
uploadRouter.post('/:folderId', uploadController.upload_post);

uploadRouter.use((err, req, res, next) => {
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
});

export default uploadRouter;
