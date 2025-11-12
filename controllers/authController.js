import prisma from '../prisma/client.js';
import bcrypt from 'bcryptjs';
import { validationResult, matchedData } from 'express-validator';
import validations from '../middlewares/validations.js';
import passport from 'passport';

const signup_get = (req, res) => {
  res.render('pages/sign-up', {
    title: 'Sign Up',
    formData: {},
  });
};

const signup_post = [
  validations.signup,
  async (req, res, next) => {
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
  },
];

const signin_get = (req, res) => {
  res.render('pages/sign-in', {
    title: 'Sign In',
    formData: {},
  });
};

const signin_post = [
  validations.signin,
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
    passport.authenticate('local', (error, user, info) => {
      if (error) return next(error);

      if (!user) {
        return res.render('pages/sign-in', {
          formData: req.body,
          title: 'Sign In',
          message: info.message,
        });
      }

      req.logIn(user, (error) => {
        if (error) return next(error);
        res.redirect('/');
      });
    })(req, res, next);
  },
];

const logout = (req, res, next) => {
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
