import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import path from 'node:path';
import morgan from 'morgan';
import configurePassport from './config/passport.js';
import prisma from './prisma/client.js';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import { fileURLToPath } from 'node:url';
import { NotFoundError } from './errors/CustomErrors.js';
import indexRouter from './routes/indexRouter.js';
import authRouter from './routes/authRouter.js';
import uploadRouter from './routes/uploadRouter.js';
import folderRouter from './routes/folderRouter.js';
import fileRouter from './routes/fileRouter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const assetsPath = path.join(__dirname, 'public');
const sessionStore = new PrismaSessionStore(prisma, {
  dbRecordIdIsSessionId: true,
  checkPeriod: 1000 * 60 * 60 * 24, // 1 day
});

//app setup
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//global middlewares
morgan('combined', {
  skip: (req, res) => {
    return res.statusCode < 400;
  },
});

app.use(express.static(assetsPath));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    },
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
  }),
);
configurePassport(passport);
app.use(passport.session());
app.use((req, res, next) => {
  if (req.user) {
    res.locals.user = req.user;
    // console.log('USER : ', req.user);
  }
  next();
});

//routing
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/upload', uploadRouter);
app.use('/folder', folderRouter);
app.use('/file', fileRouter);

//errors handling
app.use((req, resm, next) => {
  next(new NotFoundError('Page not found!'));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).render('pages/404');
});

//start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, (err) => {
  if (err) {
    throw err;
  }

  console.log('🌎 Server is running on PORT ', PORT);
});
