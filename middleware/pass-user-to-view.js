module.exports = (req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.csrfToken = req.csrfToken(); // Ensure this line is included to provide CSRF token to views
    next();
  };
  