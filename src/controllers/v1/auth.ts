import { Request, Response } from "express";
import {
  Get,
  Controller,
  Put,
  ClassWrapper,
  ClassMiddleware
} from "@overnightjs/core";
import { bruteForceHandler } from "../../helpers/middleware";
import asyncHandler from "express-async-handler";
import { keyCloakListUsers, createKeyCloakUser } from "../../helpers/keycloak";

@Controller("v1/auth")
@ClassMiddleware(bruteForceHandler)
@ClassWrapper(asyncHandler)
export class AuthController {
  @Get("users")
  async loginWithKeyCloak(req: Request, res: Response) {
    res.json(await keyCloakListUsers());
  }

  @Put("users")
  async registerWithKeyCloak(req: Request, res: Response) {
    res.json(await createKeyCloakUser(req.body));
  }
}
