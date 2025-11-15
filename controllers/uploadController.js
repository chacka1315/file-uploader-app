import prisma from '../prisma/client.js';
import multer from 'multer';
import fs from 'node:fs';
import mime from 'mime-types';
import { Buffer } from 'node:buffer';
import auth from '../middlewares/auth.js';
import { NotFoundError, BadRequestError } from '../errors/CustomErrors.js';
import cloudinary from '../config/cloudinary.js';
import { log } from 'node:console';

const upload_get = (req, res) => {
  const { folderId } = req.params;
  res.render('pages/uploadForm', {
    folderId,
    title: 'Upload',
  });
};

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
    file.downloadName = originalname;
    const extension = mime.extension(file.mimetype);
    name = `${name}_${Date.now()}.${extension}`;
    file.name = name;
    cb(null, name);
  },
});

const MB_10 = 10 * 1024 * 1024;
const upload = multer({ storage, limits: { fileSize: MB_10 } });

const upload_post = [
  auth.isAuth,
  upload.array('files', 5),
  async (req, res, next) => {
    let { folderId } = req.params;
    folderId = Number(folderId);
    if (!req.files.length) {
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
          ownerId: req.user.id,
        },
      });

      if (!currentUserIsOwner) {
        return next(
          new NotFoundError('Unauthorized to upload in thtis folder.'),
        );
      }

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

      res.render('pages/uploadForm', {
        folderId,
        title: 'Upload',
        success_upload_msg: 'Uploaded successfully.',
      });
    } catch (err) {
      if (err.http_code === 400) {
        req.files.forEach((file) => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
        return next(new BadRequestError(err.message));
      }
      next(err);
    }
  },
];

export default { upload_get, upload_post };
