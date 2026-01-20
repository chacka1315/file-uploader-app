import { User as dbUser } from '@prisma/client';

declare global {
  namespace Express {
    interface User extends dbUser {}
    interface Request {
      [index: string]: any;
    }
    namespace Multer {
      interface File {
        name: string;
        downloadName: string;
      }
    }
  }
}
