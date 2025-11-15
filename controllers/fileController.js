import prisma from '../prisma/client.js';
import { NotFoundError, BadRequestError } from '../errors/CustomErrors.js';
import path from 'node:path';
import cloudinary from '../config/cloudinary.js';
import { pipeline } from 'node:stream';
import { promisify } from 'node:util';
const pipelineAsync = promisify(pipeline);

const file_delete_post = async (req, res, next) => {
  let { id } = req.params;
  id = Number(id);

  try {
    const deleted = await prisma.file.delete({
      where: {
        id,
        folder: {
          ownerId: req.user.id,
        },
      },
      select: { folderId: true, cloudinaryPublicId: true },
    });

    await cloudinary.uploader.destroy(deleted.cloudinaryPublicId);
    res.redirect(`/folder/${deleted.folderId}/view`);
  } catch (err) {
    if (err.code === 'P2025') {
      return next(new NotFoundError('Unauthorized to delete this file.'));
    }
    next(err);
  }
};

const file_download_get = async (req, res, next) => {
  let { id } = req.params;
  id = Number(id);
  try {
    const file = await prisma.file.findUnique({
      where: {
        id,
        folder: {
          ownerId: req.user.id,
        },
      },
      select: { url: true, downloadName: true },
    });

    if (!file) {
      return next(new BadRequestError('Unauthorized to download this file!'));
    }

    const response = await fetch(file.url);
    if (!response.ok) return next(new BadRequestError('Unavailable file!'));

    const name = encodeURIComponent(file.downloadName);

    res.setHeader(
      'Content-Type',
      response.headers.get('content-type') || 'application/octet-stream',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${name}`,
    );
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Length', response.headers.get('content-length'));

    await pipelineAsync(response.body, res);
  } catch (err) {
    next(err);
  }
};

export default { file_delete_post, file_download_get };
