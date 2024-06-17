import { ExtractJwt, Strategy } from "passport-jwt";
import { config } from "dotenv";
import passport from "passport";
import { findUserByEmail } from "../models/userModel.js";

config();
var cookieExtractor = function (req) {
  var token = null;
  if (req && req.cookies) {
    token = req.cookies.token;
  }
  console.log(token);
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
      findUserByEmail(payload.email, (err, user) => {
        if (err) {
          return done(err, false);
        }
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      });
    })
  );
};
