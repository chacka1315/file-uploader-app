import auth from '../middlewares/auth.js';
import prisma from '../prisma/client.js';

const file_delete_get = [
  auth.isAuth,
  (req, res, next) => {
    let { id } = req.params;
    id = Number(id);

    try {
      prisma.file.delete({
        where: {
          id,
          folder: {
            ownerId: req.user.id,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  },
];

export default { file_delete_get };
