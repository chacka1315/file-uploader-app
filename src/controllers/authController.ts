import prisma from '../prisma/client.js';
import bcrypt from 'bcryptjs';
import { validationResult, matchedData } from 'express-validator';
import passport from 'passport';
import type { RequestHandler } from 'express';
import { User } from '@prisma/client';

const signup_get: RequestHandler = (req, res) => {
  res.render('pages/sign-up', {
    title: 'Sign Up',
    formData: {},
  });
};

const signup_post: RequestHandler = async (req, res, next) => {
  const validationErr = validationResult(req);

  if (!validationErr.isEmpty()) {
    const errors = validationErr.array();
    return res.render('pages/sign-up', {
      errors,
      formData: req.body,
      title: 'Sign Up',
    });
  }

  const { username, firstname, lastname, password } = matchedData(req);

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const data = { username, firstname, lastname, password: hashedPassword };
    await prisma.user.create({ data });
    res.redirect('/auth/sign-in');
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const signin_get: RequestHandler = (req, res) => {
  res.render('pages/sign-in', {
    title: 'Sign In',
    formData: {},
  });
};

interface AuthRequest extends Request {
  logIn: (user: User, cb: Function) => void;
}
const signin_post: RequestHandler[] = [
  (req, res, next) => {
    const validationErr = validationResult(req);
    if (!validationErr.isEmpty()) {
      const errors = validationErr.array();
      return res.render('pages/sign-in', {
        errors,
        title: 'Sign In',
        formData: req.body,
      });
    }
    next();
  },
  (req, res, next) => {
    passport.authenticate(
      'local',
      (error: Error, user: User, info: { message: string }) => {
        if (error) return next(error);

        if (!user) {
          return res.render('pages/sign-in', {
            formData: req.body,
            title: 'Sign In',
            message: info.message,
          });
        }

        req.logIn(user, (error: Error) => {
          if (error) return next(error);
          res.redirect('/');
        });
      },
    )(req, res, next);
  },
];

const logout: RequestHandler = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/');
  });
};

export default {
  signin_get,
  signup_get,
  signup_post,
  signin_post,
  logout,
};
