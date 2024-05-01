import { ExtractJwt, Strategy } from "passport-jwt";
import { config } from "dotenv";
import passport from "passport";

config();
var cookieExtractor = function (req) {
  var token = null;
  if (req && req.cookies) {
    token = req.cookies.token;
  }
  return token;
};

export const applyPassportStrategy = () => {
  const options = {};
  options.secretOrKey = process.env.SECRET_KEY;
  let jwt = null;
  try {
    jwt = ExtractJwt.fromExtractors([cookieExtractor]);
  }
  catch (error) {
    return null;
  }
  options.jwtFromRequest = jwt;
  passport.use(
    new Strategy(options, async (payload, done) => {
      let result = await findOne([payload.email]);
      result = result[0];
      if (result) {
        return done(null, result);
      }
      return done(null, false);
    })
  );
};
