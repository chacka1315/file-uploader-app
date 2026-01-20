import prisma from '../prisma/client.js';
import mime from 'mime-types';
import fs from 'node:fs';

import { NotFoundError, BadRequestError } from '../errors/CustomErrors.js';
import cloudinary from '../config/cloudinary.js';
import { RequestHandler } from 'express';

const upload_get: RequestHandler = (req, res) => {
  const { folderId } = req.params;
  res.render('pages/uploadForm', {
    folderId,
    title: 'Upload',
  });
};

const upload_post: RequestHandler = async (req, res, next) => {
  let id = req.params.folderId;
  const folderId = Number(id);

  if (!req.files?.length) {
    return res.status(404).render('pages/uploadForm', {
      folderId,
      title: 'Upload',
      failed_upload_msg: 'No file uploaded.',
    });
  }

  try {
    const currentUserIsOwner = await prisma.folder.findUnique({
      where: {
        id: folderId,
        ownerId: req.user!.id,
      },
    });

    if (!currentUserIsOwner) {
      return next(new NotFoundError('Unauthorized to upload in thtis folder.'));
    }

    if (Array.isArray(req.files)) {
      for (const file of req.files) {
        const isPdf = mime.extension(file.mimetype) === 'pdf';
        const results = await cloudinary.uploader.upload(`./${file.path}`, {
          folder: 'file-uploader',
          resource_type: isPdf ? 'raw' : 'auto',
        });

        await prisma.file.create({
          data: {
            folderId,
            name: file.name,
            downloadName: file.downloadName,
            size: file.size,
            mimetype: file.mimetype,
            url: results.secure_url,
            cloudinaryPublicId: results.public_id,
          },
        });

        await fs.promises.unlink(`./${file.path}`);
      }
    }

    res.render('pages/uploadForm', {
      folderId,
      title: 'Upload',
      success_upload_msg: 'Uploaded successfully.',
    });
  } catch (err) {
    if (err instanceof Error && 'http_code' in err && err.http_code === 400) {
      if (Array.isArray(req.files)) {
        req.files.forEach((file: { path: string }) => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      return next(new BadRequestError((err as any).message));
    }
    next(err);
  }
};

export default { upload_get, upload_post };
