import express from 'express';
import validations from '../middlewares/validations.js';

import shareController from '../controllers/shareController.js';

const shareRouter = express.Router();

shareRouter.get('/create/:folderId', shareController.create_share_get);
shareRouter.post(
  '/create/:folderId',
  validations.share,
  shareController.create_share_post,
);
shareRouter.get('/:shareId', shareController.read_share_get);
shareRouter.get('/link/:folderId', shareController.viewSharelink_get);

export default shareRouter;
