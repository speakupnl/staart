import { Request, Response, NextFunction } from "express";
import Brute from "express-brute";
import RateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import Joi from "@hapi/joi";
import pkg from "../../package.json";
import ms from "ms";
import { safeError } from "./errors";
import { ErrorCode, Tokens } from "../interfaces/enum";
import {
  BRUTE_LIFETIME,
  BRUTE_FREE_RETRIES,
  RATE_LIMIT_MAX,
  RATE_LIMIT_TIME,
  SPEED_LIMIT_DELAY,
  SPEED_LIMIT_COUNT,
  SPEED_LIMIT_TIME,
  PUBLIC_RATE_LIMIT_TIME,
  PUBLIC_RATE_LIMIT_MAX
} from "../config";
import { ApiKey } from "../interfaces/tables/organization";
import { joiValidate, includesDomainInCommaList } from "./utils";
import { trackUrl } from "./tracking";
import { decode } from "jsonwebtoken";
const store = new Brute.MemoryStore();
const bruteForce = new Brute(store, {
  freeRetries: BRUTE_FREE_RETRIES,
  lifetime: BRUTE_LIFETIME
});
const rateLimiter = RateLimit({
  windowMs: RATE_LIMIT_TIME,
  max: RATE_LIMIT_MAX
});
const publicRateLimiter = RateLimit({
  windowMs: PUBLIC_RATE_LIMIT_TIME,
  max: PUBLIC_RATE_LIMIT_MAX
});
const speedLimiter = slowDown({
  windowMs: SPEED_LIMIT_TIME,
  delayAfter: SPEED_LIMIT_COUNT,
  delayMs: SPEED_LIMIT_DELAY
});

/**
 * Handle any errors for Express
 */
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error.api_error_code) {
    // Handle Chargebee errors
    error = error.message;
  }
  const response = safeError(error.toString().replace("Error: ", ""));
  res.status(response.status);
  res.json({ error: response.code, message: response.message });
};

/**
 * Add locals for IP address and user agent
 */
export const trackingHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.locals.userAgent = req.get("User-Agent");
  res.setHeader("X-Api-Version", pkg.version);
  let ip =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress;
  if (ip === "::1") ip = "2001:67c:2564:a309:f0e0:1ee6:137b:29e8";
  if (typeof ip === "string") ip = ip.split(",")[0];
  if (Array.isArray(ip) && ip.length) ip = ip[0];
  res.locals.ipAddress = ip;
  res.locals.referrer = req.headers.referer as string;
  trackUrl(req, res)
    .then(() => {})
    .then(() => {})
    .finally(() => next());
};

export interface ApiKeyToken {
  type: string;
  apiKey: ApiKey;
}

/**
 * Add locals for a user after verifying their token
 */
export const authHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let userJwt = req.get("Authorization");
  if (userJwt) {
    if (userJwt.startsWith("Bearer ")) userJwt = userJwt.replace("Bearer ", "");
    const decoded = decode(userJwt);
    if (decoded && typeof decoded === "object") {
      if (decoded.exp * 1000 < new Date().getTime()) {
        // Token has expired
      }
      decoded.id = decoded.sub;
      decoded.token = userJwt;
      res.locals.token = decoded;
    }
  }
  next();
};

/**
 * Brute force middleware
 */
export const bruteForceHandler = bruteForce.prevent;

/**
 * Response caching middleware
 * @param time - Amount of time to cache contenr for
 */
export const cachedResponse = (time: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    res.set(
      "Cache-Control",
      `max-age=${Math.floor(ms(time) / 1000)}, must-revalidate`
    );
    return next();
  };
};

export const validator = (
  schemaMap: Joi.SchemaMap,
  type: "body" | "params" | "query"
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    let data: any;
    switch (type) {
      case "params":
        data = req.params;
        break;
      case "query":
        data = req.query;
        break;
      default:
        data = req.body;
        break;
    }
    joiValidate(schemaMap, data);
    next();
  };
};
