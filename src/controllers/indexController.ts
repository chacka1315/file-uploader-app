import { RequestHandler } from 'express';

const index_get: RequestHandler = (req, res) => {
  res.render('pages/index', {
    title: 'Home',
  });
};

export default { index_get };
