import express from 'express';
import fileController from '../controllers/fileController.js';

const fileRouter = express.Router();

fileRouter.post('/:id/delete', fileController.file_delete_post);
fileRouter.get('/:id/download', fileController.file_download_get);

export default fileRouter;
