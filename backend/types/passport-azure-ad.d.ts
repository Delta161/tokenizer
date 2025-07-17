declare module 'passport-azure-ad' {
  import { Strategy } from 'passport';

  export interface IOIDCStrategyOption {
    identityMetadata: string;
    clientID: string;
    responseType?: string;
    responseMode?: string;
    redirectUrl: string;
    allowHttpForRedirectUrl?: boolean;
    clientSecret?: string;
    validateIssuer?: boolean;
    isB2C?: boolean;
    issuer?: string;
    passReqToCallback?: boolean;
    scope?: string[];
    loggingLevel?: string;
    nonceLifetime?: number;
    nonceMaxAmount?: number;
    useCookieInsteadOfSession?: boolean;
    cookieEncryptionKeys?: any[];
    clockSkew?: number;
  }

  export interface IProfile {
    oid?: string;
    upn?: string;
    displayName?: string;
    name?: {
      familyName?: string;
      givenName?: string;
    };
    emails?: Array<{ value: string }>;
    _raw?: string;
    _json?: any;
  }

  export type VerifyCallback = (err?: Error | null, user?: any, info?: any) => void;

  // Basic verify function without req
  export type VerifyFunction = (profile: IProfile, done: VerifyCallback) => void;

  // Verify function with req parameter
  export type VerifyFunctionWithReq = (req: any, profile: IProfile, done: VerifyCallback) => void;

  // Extended verify functions for different parameter combinations
  export type VerifyFunctionWithIss = (
    iss: string,
    sub: string,
    profile: IProfile,
    done: VerifyCallback
  ) => void;

  export type VerifyFunctionWithTokens = (
    iss: string,
    sub: string,
    profile: IProfile,
    accessToken: string,
    refreshToken: string,
    done: VerifyCallback
  ) => void;

  export type VerifyFunctionWithReqAndTokens = (
    req: any,
    iss: string,
    sub: string,
    profile: IProfile,
    accessToken: string,
    refreshToken: string,
    done: VerifyCallback
  ) => void;

  export type VerifyFunctionWithParams = (
    iss: string,
    sub: string,
    profile: IProfile,
    accessToken: string,
    refreshToken: string,
    params: any,
    done: VerifyCallback
  ) => void;

  export type VerifyFunctionWithJwtClaims = (
    iss: string,
    sub: string,
    profile: IProfile,
    jwtClaims: any,
    accessToken: string,
    refreshToken: string,
    params: any,
    done: VerifyCallback
  ) => void;

  // Union type for all possible verify functions
  export type AnyVerifyFunction = 
    | VerifyFunction
    | VerifyFunctionWithReq
    | VerifyFunctionWithIss
    | VerifyFunctionWithTokens
    | VerifyFunctionWithReqAndTokens
    | VerifyFunctionWithParams
    | VerifyFunctionWithJwtClaims;

  export class OIDCStrategy extends Strategy {
    constructor(options: IOIDCStrategyOption, verify: AnyVerifyFunction);
    name: string;
  }

  export class BearerStrategy extends Strategy {
    constructor(options: any, verify: any);
    name: string;
  }
}