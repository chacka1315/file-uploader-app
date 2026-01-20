import prisma from '../prisma/client.js';
import { NotFoundError, BadRequestError } from '../errors/CustomErrors.js';
import cloudinary from '../config/cloudinary.js';
import { pipeline } from 'node:stream';
import { promisify } from 'node:util';
import type { RequestHandler } from 'express';

const pipelineAsync = promisify(pipeline);

const file_delete_post: RequestHandler = async (req, res, next) => {
  let { id } = req.params;
  let fileId: number;
  if (typeof id !== 'string') {
    fileId = Number(id[0]);
  }
  fileId = Number(id);

  try {
    const deleted = await prisma.file.delete({
      where: {
        id: fileId,
        folder: {
          ownerId: req.user?.id,
        },
      },
      select: { folderId: true, cloudinaryPublicId: true },
    });

    await cloudinary.uploader.destroy(deleted.cloudinaryPublicId);
    res.redirect(`/folder/${deleted.folderId}/view`);
  } catch (err) {
    if (err instanceof Error && 'code' in err && err.code === 'P2025') {
      return next(new NotFoundError('Unauthorized to delete this file.'));
    }
    next(err);
  }
};

const file_download_get: RequestHandler = async (req, res, next) => {
  let { id } = req.params;
  let fileId: number;
  if (typeof id !== 'string') {
    fileId = Number(id[0]);
  }
  fileId = Number(id);

  try {
    const file = await prisma.file.findUnique({
      where: {
        id: fileId,
        OR: [
          {
            folder: {
              ownerId: req.user?.id,
            },
          },
          {
            folder: {
              share: {
                isNot: null,
              },
            },
          },
        ],
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
    res.setHeader('Content-Length', response.headers.get('content-length')!);

    if (response.body) {
      await pipelineAsync(response.body, res);
    }
  } catch (err) {
    next(err);
  }
};

export default { file_delete_post, file_download_get };
