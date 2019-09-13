import { sign, verify, decode } from "jsonwebtoken";
import {
  JWT_ISSUER,
  JWT_SECRET,
  TOKEN_EXPIRY_EMAIL_VERIFICATION,
  TOKEN_EXPIRY_PASSWORD_RESET,
  TOKEN_EXPIRY_LOGIN,
  TOKEN_EXPIRY_REFRESH,
  TOKEN_EXPIRY_APPROVE_LOCATION,
  TOKEN_EXPIRY_API_KEY_MAX
} from "../config";
import { User, AccessToken } from "../interfaces/tables/user";
import { Tokens, ErrorCode, EventType, Templates } from "../interfaces/enum";
import {
  deleteSensitiveInfoUser,
  removeFalsyValues,
  includesDomainInCommaList
} from "./utils";
import { Locals } from "../interfaces/general";
import { mail } from "./mail";
import i18n from "../i18n";
import { ApiKey } from "../interfaces/tables/organization";
import cryptoRandomString from "crypto-random-string";
import ipRangeCheck from "ip-range-check";

/**
 * Generate a new JWT
 */
export const generateToken = (
  payload: string | object | Buffer,
  expiresIn: string | number,
  subject: Tokens
): Promise<string> =>
  new Promise((resolve, reject) => {
    sign(
      // Payload is expected to be a plain object
      JSON.parse(JSON.stringify(payload)),
      JWT_SECRET,
      {
        expiresIn,
        subject,
        issuer: JWT_ISSUER,
        jwtid: cryptoRandomString({ length: 12 })
      },
      (error, token) => {
        if (error) return reject(error);
        resolve(token);
      }
    );
  });

/**
 * Verify a JWT
 */
export interface TokenResponse {
  id: string;
  ipAddress?: string;
}
export interface ApiKeyResponse {
  id: string;
  organizationId: string;
  scopes: string;
  jti: string;
  sub: Tokens;
  exp: number;
  ipRestrictions?: string;
  referrerRestrictions?: string;
}
export const verifyToken = (
  token: string,
  subject: Tokens
): Promise<TokenResponse | ApiKeyResponse> =>
  new Promise((resolve, reject) => {
    verify(token, JWT_SECRET, { subject }, (error, data) => {
      if (error) return reject(error);
      resolve(data as TokenResponse | ApiKeyResponse);
    });
  });

/**
 * Generate a new email verification JWT
 */
export const emailVerificationToken = (id: string) =>
  generateToken({ id }, TOKEN_EXPIRY_EMAIL_VERIFICATION, Tokens.EMAIL_VERIFY);

/**
 * Generate a new password reset JWT
 */
export const passwordResetToken = (id: string) =>
  generateToken({ id }, TOKEN_EXPIRY_PASSWORD_RESET, Tokens.PASSWORD_RESET);

/**
 * Generate a new login JWT
 */
export const loginToken = (user: User) =>
  generateToken(user, TOKEN_EXPIRY_LOGIN, Tokens.LOGIN);

/**
 * Generate a new 2FA JWT
 */
export const twoFactorToken = (user: User) =>
  generateToken({ id: user.id }, TOKEN_EXPIRY_LOGIN, Tokens.TWO_FACTOR);

/**
 * Generate an API key JWT
 */
export const apiKeyToken = (apiKey: ApiKey) => {
  const createApiKey = { ...removeFalsyValues(apiKey) };
  delete createApiKey.createdAt;
  delete createApiKey.jwtApiKey;
  delete createApiKey.updatedAt;
  delete createApiKey.name;
  delete createApiKey.description;
  delete createApiKey.expiresAt;
  return generateToken(
    createApiKey,
    (apiKey.expiresAt
      ? new Date(apiKey.expiresAt).getTime()
      : TOKEN_EXPIRY_API_KEY_MAX) - new Date().getTime(),
    Tokens.API_KEY
  );
};
/**
 * Generate an access token
 */
export const accessToken = (accessToken: AccessToken) => {
  const createAccessToken = { ...removeFalsyValues(accessToken) };
  delete createAccessToken.createdAt;
  delete createAccessToken.jwtAccessToken;
  delete createAccessToken.updatedAt;
  delete createAccessToken.name;
  delete createAccessToken.description;
  delete createAccessToken.expiresAt;
  return generateToken(
    createAccessToken,
    (accessToken.expiresAt
      ? new Date(accessToken.expiresAt).getTime()
      : TOKEN_EXPIRY_API_KEY_MAX) - new Date().getTime(),
    Tokens.ACCESS_TOKEN
  );
};

/**
 * Generate a new approve location JWT
 */
export const approveLocationToken = (id: string, ipAddress: string) =>
  generateToken(
    { id, ipAddress },
    TOKEN_EXPIRY_APPROVE_LOCATION,
    Tokens.APPROVE_LOCATION
  );

export const checkIpRestrictions = (apiKey: ApiKeyResponse, locals: Locals) => {
  if (!apiKey.ipRestrictions) return;
  if (
    !ipRangeCheck(
      locals.ipAddress,
      apiKey.ipRestrictions.split(",").map(range => range.trim())
    )
  )
    throw new Error(ErrorCode.IP_RANGE_CHECK_FAIL);
};

export const checkReferrerRestrictions = (
  apiKey: ApiKeyResponse,
  domain: string
) => {
  if (!apiKey.referrerRestrictions || !domain) return;
  if (!includesDomainInCommaList(apiKey.referrerRestrictions, domain))
    throw new Error(ErrorCode.REFERRER_CHECK_FAIL);
};
