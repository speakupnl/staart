import { Request, Response } from "express";
import {
  Get,
  Controller,
  ClassWrapper,
  ClassMiddleware,
  Patch,
  Delete,
  Post,
  Put
} from "@overnightjs/core";
import {
  listUsersForUser,
  getUserForUser,
  updateUserForUser,
  deleteUserForUser,
  updatePasswordOfUserForUser,
  sendEmailVerificationToUserForUser,
  getUserGroupsForUser,
  removeUserFromGroupForUser
} from "../../rest/user";
import { authHandler } from "../../helpers/middleware";
import asyncHandler from "express-async-handler";

@Controller("v1/users")
@ClassMiddleware(authHandler)
@ClassWrapper(asyncHandler)
export class AuthController {
  @Get()
  async listUsers(req: Request, res: Response) {
    res.json(await listUsersForUser(res.locals.token));
  }

  @Get(":id")
  async getUser(req: Request, res: Response) {
    res.json(await getUserForUser(res.locals.token, req.params.id));
  }

  @Patch(":id")
  async updateUser(req: Request, res: Response) {
    res.json(
      await updateUserForUser(res.locals.token, req.params.id, req.body)
    );
  }

  @Delete(":id")
  async deleteUser(req: Request, res: Response) {
    res.json(await deleteUserForUser(res.locals.token, req.params.id));
  }

  @Put(":id/password")
  async updateUserPassword(req: Request, res: Response) {
    res.json(
      await updatePasswordOfUserForUser(
        res.locals.token,
        req.params.id,
        req.body.oldPassword,
        req.body.newPassword
      )
    );
  }

  @Post(":id/resend-verification")
  async resendVerification(req: Request, res: Response) {
    res.json(
      await sendEmailVerificationToUserForUser(res.locals.token, req.params.id)
    );
  }

  /**
   * User groups
   */

  @Get(":id/groups")
  async getUserGroups(req: Request, res: Response) {
    res.json(await getUserGroupsForUser(res.locals.token, req.params.id));
  }

  @Delete(":id/groups/:groupId")
  async removeUserFromGroup(req: Request, res: Response) {
    res.json(
      await removeUserFromGroupForUser(
        res.locals.token,
        req.params.id,
        req.params.groupId
      )
    );
  }
}
