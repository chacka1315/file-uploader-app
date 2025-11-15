const isAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect('/auth/sign-in');
};

export default { isAuth };
