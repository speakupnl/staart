import { Request, Response } from "express";
import {
  Controller,
  Post,
  ClassWrapper,
  ClassMiddleware,
  Middleware
} from "@overnightjs/core";
import Joi from "@hapi/joi";
import { bruteForceHandler, validator } from "../../helpers/middleware";
import asyncHandler from "express-async-handler";
import { keyCloakCreateUser, keyCloakLoginUser } from "../../helpers/keycloak";
import { resetPasswordForUser, changePasswordForUser } from "../../rest/user";
import { verifyToken } from "../../helpers/jwt";
import { ErrorCode } from "../../interfaces/enum";

@Controller("v1/auth")
@ClassMiddleware(bruteForceHandler)
@ClassWrapper(asyncHandler)
export class AuthController {
  @Post("register")
  async registerWithKeyCloak(req: Request, res: Response) {
    res.json(await keyCloakCreateUser(req.body));
  }

  @Post("verify-token")
  @Middleware(
    validator(
      {
        token: Joi.string().required(),
        subject: Joi.string().required()
      },
      "body"
    )
  )
  async postVerifyToken(req: Request, res: Response) {
    const token =
      req.body.token || (req.get("Authorization") || "").replace("Bearer ", "");
    const subject = req.body.subject;
    try {
      const data = await verifyToken(token, subject);
      res.json({ verified: true, data });
    } catch (error) {
      throw new Error(ErrorCode.INVALID_TOKEN);
    }
  }

  @Post("login")
  async loginWithKeyCloak(req: Request, res: Response) {
    res.json(await keyCloakLoginUser(req.body.username, req.body.password));
  }

  @Post("reset-password/request")
  async requestPasswordReset(req: Request, res: Response) {
    res.json(await resetPasswordForUser(req.body.email));
  }

  @Post("reset-password/recover")
  async recoverPasswordReset(req: Request, res: Response) {
    res.json(await changePasswordForUser(req.body.token, req.body.password));
  }
}
