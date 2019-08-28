import { Request, Response } from "express";
import {
  Get,
  Controller,
  Put,
  ClassWrapper,
  ClassMiddleware,
  Patch,
  Delete,
  Post
} from "@overnightjs/core";
import { bruteForceHandler } from "../../helpers/middleware";
import asyncHandler from "express-async-handler";
import {
  keyCloakListUsers,
  keyCloakGetUser,
  keyCloakUpdateUser,
  keyCloakDeleteUser,
  keyCloakGetUserGroups,
  keyCloakUpdatePasswordForUser,
  keyCloakSendEmailVerificationToUser,
  keyCloakRemoveUserFromGroup
} from "../../helpers/keycloak";

@Controller("v1/users")
@ClassMiddleware(bruteForceHandler)
@ClassWrapper(asyncHandler)
export class AuthController {
  @Get()
  async listUsers(req: Request, res: Response) {
    res.json(await keyCloakListUsers());
  }

  @Get(":id")
  async getUser(req: Request, res: Response) {
    res.json(await keyCloakGetUser(req.params.id));
  }

  @Patch(":id")
  async updateUser(req: Request, res: Response) {
    res.json(await keyCloakUpdateUser(req.params.id, req.body));
  }

  @Delete(":id")
  async deleteUser(req: Request, res: Response) {
    res.json(await keyCloakDeleteUser(req.params.id));
  }

  @Post(":id/password")
  async updateUserPassword(req: Request, res: Response) {
    res.json(
      await keyCloakUpdatePasswordForUser(req.params.id, req.body.password)
    );
  }

  @Post(":id/resend-verification")
  async resendVerification(req: Request, res: Response) {
    res.json(await keyCloakSendEmailVerificationToUser(req.params.id));
  }

  /**
   * User groups
   */

  @Get(":id/groups")
  async getUserGroups(req: Request, res: Response) {
    res.json(await keyCloakGetUserGroups(req.params.id));
  }

  @Delete(":id/groups/:groupId")
  async removeUserFromGroup(req: Request, res: Response) {
    res.json(
      await keyCloakRemoveUserFromGroup(req.params.id, req.params.groupId)
    );
  }
}
