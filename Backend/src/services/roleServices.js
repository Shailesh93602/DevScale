export const validateRole = (role_id) => (req, res, next) => {
    if (!req.user) {
      return res.redirect("/u/signIn");
    }
    if (req.user.role_id == role_id) {
      next();
    } else {
      res.redirect("/u/signIn");
    }
  }
  
  