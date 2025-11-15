import validations from '../middlewares/validations.js';
import prisma from '../prisma/client.js';
import { matchedData, validationResult } from 'express-validator';
import auth from '../middlewares/auth.js';
import { NotFoundError } from '../errors/CustomErrors.js';

const folder_create_get = [
  auth.isAuth,
  (req, res) => {
    res.render('pages/createFolder', {
      title: 'New folder',
      formData: {},
    });
  },
];

const folder_create_post = [
  auth.isAuth,
  validations.folder,
  async (req, res, next) => {
    const validationsErr = validationResult(req);
    if (!validationsErr.isEmpty()) {
      const errors = validationsErr.array();
      return res.render('pages/createFolder', {
        errors,
        title: 'New folder',
        formData: req.body,
      });
    }

    const data = {
      name: matchedData(req).folder_name,
      ownerId: req.user.id,
    };

    try {
      await prisma.folder.create({ data });
      res.redirect('/');
    } catch (err) {
      next(err);
    }
  },
];

const folder_view_get = async (req, res, next) => {
  let { id } = req.params;
  id = Number(id);
  if (!id) {
    throw new NotFoundError('Try to view folder with invalid id!');
  }

  try {
    const folder = await prisma.folder.findUnique({
      where: {
        id,
        ownerId: req.user.id,
      },
      include: {
        files: true,
      },
    });

    if (!folder) {
      throw new NotFoundError('Try to open a folder wich does not exist!');
    }

    folder.files.forEach((file) => {
      const date = new Date(file.uploadedAt).toLocaleDateString();
      const size = (file.size / (1024 * 1024)) * 100;
      file.size = Math.round(size) / 100;
      file.uploadedAt = date;
    });

    res.render('pages/folderContent', {
      folder,
      title: folder.name,
    });
  } catch (err) {
    next(err);
  }
};

const folder_update_get = async (req, res, next) => {
  let { id } = req.params;
  id = Number(id);
  if (!id) {
    throw new NotFoundError('Try to view file with invalid id!');
  }

  try {
    const folder = await prisma.folder.findUnique({
      where: {
        id,
        ownerId: req.user.id,
      },
    });

    if (!folder) {
      throw new NotFoundError('Try to update file wich does not exist!');
    }
    res.render('pages/updateFolder', {
      folder,
      title: 'Update',
    });
  } catch (err) {
    next(err);
  }
};

const folder_update_post = [
  validations.folder,
  async (req, res, next) => {
    let { id } = req.params;
    id = Number(id);
    const validationsErr = validationResult(req);

    if (!validationsErr.isEmpty()) {
      const errors = validationsErr.array();
      const folder = {
        id,
        name: req.body.folder_name,
      };

      return res.render('pages/updateFolder', {
        errors,
        folder,
        title: 'Update',
      });
    }

    const { folder_name } = matchedData(req);

    try {
      await prisma.folder.update({
        data: {
          name: folder_name,
        },
        where: {
          id: id,
          ownerId: req.user.id,
        },
      });
      res.redirect(`/folder/${id}/view`);
    } catch (err) {
      next(err);
    }
  },
];

const folder_delete_post = async (req, res, next) => {
  let { id } = req.params;
  id = Number(id);
  if (!id) {
    throw new NotFoundError('Try to view file with invalid id!');
  }

  try {
    await prisma.folder.delete({
      where: {
        id: id,
        ownerId: req.user.id,
      },
    });
    res.redirect('/');
  } catch (err) {
    next(err);
  }
};

export default {
  folder_create_get,
  folder_create_post,
  folder_view_get,
  folder_update_get,
  folder_update_post,
  folder_delete_post,
};
