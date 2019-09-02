import { Request, Response } from "express";
import {
  Controller,
  Post,
  ClassWrapper,
  ClassMiddleware
} from "@overnightjs/core";
import { bruteForceHandler } from "../../helpers/middleware";
import asyncHandler from "express-async-handler";
import { keyCloakCreateUser, keyCloakLoginUser } from "../../helpers/keycloak";

@Controller("v1/auth")
@ClassMiddleware(bruteForceHandler)
@ClassWrapper(asyncHandler)
export class AuthController {
  @Post("register")
  async registerWithKeyCloak(req: Request, res: Response) {
    res.json(await keyCloakCreateUser(req.body));
  }

  @Post("login")
  async loginWithKeyCloak(req: Request, res: Response) {
    res.json(await keyCloakLoginUser(req.body.username, req.body.password));
  }
}
