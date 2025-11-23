import { IUserDoc } from './modules/user/user.interfaces';

declare module 'express-serve-static-core' {
  export interface Request {
    user: IUserDoc;
  }
}

declare module 'passport-apple' {
  import { Request } from 'express';
  import { Strategy as PassportStrategy } from 'passport';

  export interface Profile {
    id?: string;
    sub: string;
    email?: string;
    name?: {
      firstName?: string;
      lastName?: string;
    };
  }

  export interface StrategyOptions {
    clientID: string;
    teamID: string;
    keyID: string;
    privateKeyString: string;
    callbackURL: string;
    scope?: string[];
    passReqToCallback?: boolean;
  }

  export type VerifyCallback = (error: Error | null, user?: object | false, info?: object) => void;

  export type VerifyFunction = (
    accessToken: string,
    refreshToken: string,
    idToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) => void;

  export default class Strategy extends PassportStrategy {
    constructor(options: StrategyOptions, verify: VerifyFunction);
    name: string;
    authenticate(req: Request, options?: object): void;
  }
}
