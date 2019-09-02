import { Request, Response } from "express";
import {
  Get,
  Controller,
  ClassWrapper,
  ClassMiddleware,
  Patch,
  Delete,
  Put
} from "@overnightjs/core";
import {
  listGroupsForUser,
  getGroupForUser,
  updateGroupForUser,
  deleteGroupForUser,
  addUserToGroupForUser,
  removeUserFromGroupForUser,
  getGroupMembersForUser,
  createGroupForUser
} from "../../rest/group";
import { authHandler } from "../../helpers/middleware";
import asyncHandler from "express-async-handler";

@Controller("v1/groups")
@ClassMiddleware(authHandler)
@ClassWrapper(asyncHandler)
export class AuthController {
  @Get()
  async listGroups(req: Request, res: Response) {
    res.json(await listGroupsForUser(res.locals.token));
  }

  @Put()
  async createGroups(req: Request, res: Response) {
    res.json(await createGroupForUser(res.locals.token, req.body));
  }

  @Get(":id")
  async getGroup(req: Request, res: Response) {
    res.json(await getGroupForUser(res.locals.token, req.params.id));
  }

  @Patch(":id")
  async updateGroup(req: Request, res: Response) {
    res.json(
      await updateGroupForUser(res.locals.token, req.params.id, req.body)
    );
  }

  @Delete(":id")
  async deleteGroup(req: Request, res: Response) {
    res.json(await deleteGroupForUser(res.locals.token, req.params.id));
  }

  @Get(":id/members")
  async getGroupMembers(req: Request, res: Response) {
    res.json(await getGroupMembersForUser(res.locals.token, req.params.id));
  }

  @Put(":id/members/:userId")
  async addUserToGroup(req: Request, res: Response) {
    res.json(
      await addUserToGroupForUser(
        res.locals.token,
        req.params.id,
        req.params.userId
      )
    );
  }

  @Delete(":id/members/:userId")
  async deleteUserFromGroup(req: Request, res: Response) {
    res.json(
      await removeUserFromGroupForUser(
        res.locals.token,
        req.params.id,
        req.params.userId
      )
    );
  }
}
