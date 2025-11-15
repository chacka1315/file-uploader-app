import prisma from '../prisma/client.js';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';

function configurePassport(passport) {
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: {
            username: username,
          },
        });

        if (!user) {
          return done(null, false, {
            message: 'No account with that email.',
          });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          return done(null, false, { message: 'Wrong password' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    return done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: id,
        },
        include: {
          folders: true,
        },
      });
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  });
}

export default configurePassport;
