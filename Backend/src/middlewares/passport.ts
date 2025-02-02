import { ExtractJwt, Strategy } from 'passport-jwt';
import { config } from 'dotenv';
import passport from 'passport';
import { Request } from 'express';
import { JWT_SECRET } from '../config';
import prisma from '../prisma';

config();
const cookieExtractor = function (req: Request) {
  let token = null;
  if (req?.cookies) {
    token = req.cookies.token;
  }
  if (!token) {
    token = req.headers.authorization?.split(' ')[1];
  }
  if (!token) {
    token = req.headers.authorization;
  }
  return token;
};

export const applyPassportStrategy = () => {
  const options: {
    secretOrKey: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jwtFromRequest: any;
  } = {
    secretOrKey: '',
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  };
  options.secretOrKey = JWT_SECRET;
  let jwt = null;
  try {
    jwt = ExtractJwt.fromExtractors([cookieExtractor]);
  } catch (error) {
    console.error('Error creating JWT strategy:', error);
    return null;
  }
  options.jwtFromRequest = jwt;
  passport.use(
    new Strategy(options, async (payload, done) => {
      const user = await prisma.user.findFirst({
        where: { email: payload.email },
      });
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    })
  );
};
