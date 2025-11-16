import prisma from '../prisma/client.js';
import { validationResult, matchedData } from 'express-validator';
import validations from '../middlewares/validations.js';
import { NotFoundError } from '../errors/CustomErrors.js';
import { formatDistanceStrict } from 'date-fns';

const create_share_get = async (req, res) => {
  let { folderId } = req.params;
  folderId = Number(folderId);

  if (!folderId) {
    throw new NotFoundError('Try to share file with invalid id!');
  }

  res.render('pages/shareForm', {
    folderId,
    title: 'Share',
    formData: {},
  });
};

const create_share_post = [
  validations.share,
  async (req, res, next) => {
    let { folderId } = req.params;
    folderId = Number(folderId);

    if (!folderId) {
      throw new NotFoundError('Try to share file with invalid id!');
    }
    const validationsErr = validationResult(req);

    if (!validationsErr.isEmpty()) {
      const errors = validationsErr.array();
      return res.render('pages/shareForm', {
        errors,
        folderId,
        formData: req.body,
        title: 'Share',
      });
    }

    let { share_duration } = matchedData(req);
    share_duration = Number(share_duration);

    try {
      const folder = await prisma.folder.findUnique({
        where: {
          id: folderId,
          ownerId: req.user.id,
          share: { is: null },
        },
      });

      if (!folder) {
        return next(new NotFoundError('This folder cannot be shared!'));
      }

      const ONE_DAY = 1000 * 60 * 60 * 24;
      const expireDate = new Date(Date.now() + share_duration * ONE_DAY);
      const data = {
        shareId: crypto.randomUUID(),
        duration: share_duration,
        folderId: folderId,
        expiresAt: expireDate,
      };

      const share = await prisma.share.create({
        data,
        include: {
          folder: true,
        },
      });
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      res.render('pages/shareLink', {
        share,
        baseUrl,
      });
    } catch (err) {
      next(err);
    }
  },
];

const read_share_get = async (req, res, next) => {
  const { shareId } = req.params;

  try {
    const share = await prisma.share.findUnique({
      where: {
        shareId,
      },
      include: {
        folder: {
          include: {
            files: true,
            owner: true,
          },
        },
      },
    });

    if (!share) {
      return next(new NotFoundError('This share is not available!'));
    }

    if (new Date() > new Date(share.expiresAt)) {
      await prisma.share.delete({
        where: {
          shareId,
        },
      });

      return next(new NotFoundError('This share is expired'));
    }

    share.folder.files.forEach((file) => {
      const date = new Date(file.uploadedAt).toLocaleDateString();
      const size = (file.size / (1024 * 1024)) * 100;
      file.size = Math.round(size) / 100;
      file.uploadedAt = date;
    });

    const timeLeft = formatDistanceStrict(
      new Date(share.sharedAt),
      new Date(share.expiresAt),
      { unit: 'day' },
    );

    share.timeLeft = timeLeft;

    res.render('pages/shareContent', {
      share,
      title: 'Share',
    });
  } catch (err) {
    next(err);
  }
};

const viewSharelink_get = async (req, res, next) => {
  let { folderId } = req.params;
  folderId = Number(folderId);

  if (!folderId) {
    throw new NotFoundError('Try to view share link with invalid id!');
  }

  try {
    const share = await prisma.share.findUnique({
      where: {
        folderId,
      },
      include: {
        folder: true,
      },
    });

    if (!share) {
      return next(new NotFoundError('This share is not available!'));
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.render('pages/shareLink', {
      share,
      baseUrl,
    });
  } catch (err) {
    next(err);
  }
};

export default {
  create_share_get,
  read_share_get,
  create_share_post,
  viewSharelink_get,
};
