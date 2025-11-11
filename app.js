import express from 'express';
import session from 'express-session';
import passport from 'passport';
import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import morgan from 'morgan';
import NotFoundError from './errors/NotFoundError.js';
import configurePassport from './config/passport.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const assetsPath = path.join(__dirname, 'public');

//app setup
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//global middlewares
app.use(morgan('dev'));
app.use(express.static(assetsPath));
app.use(express.urlencoded({ extended: true }));

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
