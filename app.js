import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import path from 'node:path';
import morgan from 'morgan';
import NotFoundError from './errors/NotFoundError.js';
import configurePassport from './config/passport.js';
import prisma from './prisma/client.js';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import { fileURLToPath } from 'node:url';

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
app.use(morgan('dev'));
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
  if (req.user) res.locals.user = req.user;
  next();
});

app.get('/', (req, res) => {
  res.send('Hello world');
});

//errors handling
app.use((req, res) => {
  throw new NotFoundError('Page not found!');
});

app.use((err, req, res, next) => {
  console.log(err);
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
