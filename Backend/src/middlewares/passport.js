import { ExtractJwt, Strategy } from "passport-jwt";
import { config } from "dotenv";
import passport from "passport";
import db from "../../db/models/index.js";

config();
var cookieExtractor = function (req) {
  var token = null;
  if (req && req.cookies) {
    token = req.cookies.token;
  }
  if (!token) {
    token = req.headers.authorization?.split(" ")[1];
  }
  if (!token) {
    token = req.headers.authorization;
  }
  return token;
};

export const applyPassportStrategy = () => {
  const options = {};
  options.secretOrKey = process.env.SECRET_KEY;
  let jwt = null;
  try {
    jwt = ExtractJwt.fromExtractors([cookieExtractor]);
  } catch (error) {
    return null;
  }
  options.jwtFromRequest = jwt;
  passport.use(
    new Strategy(options, async (payload, done) => {
      const user = await db.User.findOne({ where: { email: payload.email } });
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    })
  );
};
