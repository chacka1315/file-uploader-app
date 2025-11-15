const index_get = (req, res) => {
  res.render('pages/index', {
    title: 'Home',
  });
};

export default { index_get };
