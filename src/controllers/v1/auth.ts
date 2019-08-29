import { Request, Response } from "express";
import {
  Controller,
  Post,
  ClassWrapper,
  ClassMiddleware
} from "@overnightjs/core";
import { bruteForceHandler } from "../../helpers/middleware";
import asyncHandler from "express-async-handler";
import { createKeyCloakUser } from "../../helpers/keycloak";

@Controller("v1/auth")
@ClassMiddleware(bruteForceHandler)
@ClassWrapper(asyncHandler)
export class AuthController {
  @Post("register")
  async registerWithKeyCloak(req: Request, res: Response) {
    res.json(await createKeyCloakUser(req.body));
  }
}
