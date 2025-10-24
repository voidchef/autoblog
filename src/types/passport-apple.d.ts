declare module 'passport-apple' {
  import { Strategy as PassportStrategy } from 'passport-strategy';

  export interface Profile {
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
  }

  export type VerifyFunction = (
    accessToken: string,
    refreshToken: string,
    idToken: string,
    profile: Profile,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    done: (error: Error | null, user?: any | false) => void
  ) => void;

  class Strategy extends PassportStrategy {
    constructor(options: StrategyOptions, verify: VerifyFunction);
    name: string;
  }

  export default Strategy;
}
