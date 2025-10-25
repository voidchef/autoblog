import fs from 'fs';
import AppleStrategy from 'passport-apple';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import config from '../../config/config';
import { OAuthConnection } from '../oauthConnection';
import { IPayload } from '../token/token.interfaces';
import tokenTypes from '../token/token.types';
import { IUserDoc } from '../user/user.interfaces';
import User from '../user/user.model';

const jwtStrategy = new JwtStrategy(
  {
    secretOrKey: config.jwt.secret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  },
  async (payload: IPayload, done) => {
    try {
      if (payload.type !== tokenTypes.ACCESS) {
        throw new Error('Invalid token type');
      }
      const user = await User.findById(payload.sub);
      if (!user) {
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
);

// Google OAuth Strategy
let googleStrategy: GoogleStrategy | null = null;

if (config.oauth.google.clientId && config.oauth.google.clientSecret) {
  googleStrategy = new GoogleStrategy(
    {
      clientID: config.oauth.google.clientId,
      clientSecret: config.oauth.google.clientSecret,
      callbackURL: config.oauth.google.callbackUrl,
      scope: ['profile', 'email'],
    },
    async (accessToken: string, refreshToken: string, params: any, profile: any, done: any) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No email found in Google profile'), false);
        }

        // Check if OAuth connection already exists
        let oauthConnection = await OAuthConnection.findOne({
          provider: 'google',
          providerId: profile.id,
        });

        let user: IUserDoc | null = null;

        if (oauthConnection) {
          // Update existing connection with new tokens
          oauthConnection.accessToken = accessToken;
          if (refreshToken) {
            oauthConnection.refreshToken = refreshToken;
          }
          if (params.expires_in) {
            oauthConnection.tokenExpiry = new Date(Date.now() + params.expires_in * 1000);
          }
          oauthConnection.email = email;
          oauthConnection.displayName = profile.displayName;
          oauthConnection.profileData = profile._json;
          await oauthConnection.save();

          user = await User.findById(oauthConnection.userId);
        } else {
          // Check if user exists with same email
          user = await User.findOne({ email });

          if (!user) {
            // Create new user
            user = await User.create({
              name: profile.displayName || 'Google User',
              email,
              isEmailVerified: true,
              hasOAuthConnection: true,
              password: Math.random().toString(36).slice(-8) + 'A1!', // Random password (won't be used)
            });
          } else {
            // Link to existing user
            user.isEmailVerified = true;
            user.hasOAuthConnection = true;
            await user.save();
          }

          // Create OAuth connection
          await OAuthConnection.create({
            userId: user._id,
            provider: 'google',
            providerId: profile.id,
            email,
            displayName: profile.displayName,
            accessToken,
            refreshToken,
            tokenExpiry: params.expires_in ? new Date(Date.now() + params.expires_in * 1000) : undefined,
            scopes: ['profile', 'email'],
            profileData: profile._json,
          });
        }

        if (!user) {
          return done(new Error('Failed to create or find user'), false);
        }

        done(null, user);
      } catch (error) {
        done(error as Error, false);
      }
    }
  );
}

// Apple OAuth Strategy
let appleStrategy: AppleStrategy | null = null;

if (config.oauth.apple.clientId && config.oauth.apple.privateKeyPath) {
  try {
    // Check if the private key file exists before trying to read it
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    if (!fs.existsSync(config.oauth.apple.privateKeyPath)) {
      throw new Error(`Apple private key file not found at: ${config.oauth.apple.privateKeyPath}`);
    }

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const privateKey = fs.readFileSync(config.oauth.apple.privateKeyPath, 'utf8');

    appleStrategy = new AppleStrategy(
      {
        clientID: config.oauth.apple.clientId,
        teamID: config.oauth.apple.teamId || '',
        keyID: config.oauth.apple.keyId || '',
        privateKeyString: privateKey,
        callbackURL: config.oauth.apple.callbackUrl,
        scope: ['email', 'name'],
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (accessToken: any, refreshToken: any, idToken: any, profile: any, done: any) => {
        try {
          const email = profile.email;
          if (!email) {
            return done(new Error('No email found in Apple profile'), false);
          }

          // Check if OAuth connection already exists
          let oauthConnection = await OAuthConnection.findOne({
            provider: 'apple',
            providerId: profile.sub,
          });

          let user: IUserDoc | null = null;

          if (oauthConnection) {
            // Update existing connection with new tokens
            oauthConnection.accessToken = accessToken;
            if (refreshToken) {
              oauthConnection.refreshToken = refreshToken;
            }
            // Apple tokens typically last 6 months
            oauthConnection.tokenExpiry = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);
            oauthConnection.email = email;
            if (profile.name) {
              const displayName = `${profile.name.firstName || ''} ${profile.name.lastName || ''}`.trim();
              if (displayName) {
                oauthConnection.displayName = displayName;
              }
            }
            oauthConnection.profileData = profile;
            await oauthConnection.save();

            user = await User.findById(oauthConnection.userId);
          } else {
            // Check if user exists with same email
            user = await User.findOne({ email });

            if (!user) {
              // Create new user
              const name = profile.name
                ? `${profile.name.firstName || ''} ${profile.name.lastName || ''}`.trim()
                : 'Apple User';

              user = await User.create({
                name: name || 'Apple User',
                email,
                isEmailVerified: true,
                hasOAuthConnection: true,
                password: Math.random().toString(36).slice(-8) + 'A1!', // Random password (won't be used)
              });
            } else {
              // Link to existing user
              user.isEmailVerified = true;
              user.hasOAuthConnection = true;
              await user.save();
            }

            // Create OAuth connection
            const displayName = profile.name
              ? `${profile.name.firstName || ''} ${profile.name.lastName || ''}`.trim()
              : undefined;

            await OAuthConnection.create({
              userId: user._id,
              provider: 'apple',
              providerId: profile.sub,
              email,
              displayName,
              accessToken,
              refreshToken,
              tokenExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
              scopes: ['email', 'name'],
              profileData: profile,
            });
          }

          if (!user) {
            return done(new Error('Failed to create or find user'), false);
          }

          done(null, user);
        } catch (error) {
          done(error as Error, false);
        }
      }
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to initialize Apple strategy:', error);
  }
}

export { jwtStrategy, googleStrategy, appleStrategy };
export default jwtStrategy;
