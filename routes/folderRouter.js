import express from 'express';
import folderController from '../controllers/folderController.js';

const folderRouter = express.Router();

folderRouter.get('/create', folderController.folder_create_get);
folderRouter.post('/create', folderController.folder_create_post);
folderRouter.get('/:id/view', folderController.folder_view_get);
folderRouter.get('/:id/update', folderController.folder_update_get);
folderRouter.post('/:id/update', folderController.folder_update_post);
folderRouter.post('/:id/delete', folderController.folder_delete_post);

export default folderRouter;
