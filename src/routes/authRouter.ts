import express from 'express';
import authController from '../controllers/authController.js';
import validations from '../middlewares/validations.js';

const authRouter = express.Router();

authRouter.get('/sign-in', authController.signin_get);
authRouter.post('/sign-in', validations.signin, authController.signin_post);
authRouter.get('/sign-up', authController.signup_get);
authRouter.post('/sign-up', validations.signup, authController.signup_post);
authRouter.get('/logout', authController.logout);

export default authRouter;
