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
  createGroupForUser,
  addUserToGroupByNameEmailForUser,
  getOrganizationBillingForUser,
  updateOrganizationBillingForUser
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

  @Put(":id/members")
  async addUserToGroupByNameEmail(req: Request, res: Response) {
    res.json(
      await addUserToGroupByNameEmailForUser(
        res.locals.token,
        req.params.id,
        req.body.email,
        req.body.firstName,
        req.body.lastName
      )
    );
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

  /**
   * Stripe and billing
   */

  @Get(":id/billing")
  async getBilling(req: Request, res: Response) {
    res.json(
      await getOrganizationBillingForUser(res.locals.token, req.params.id)
    );
  }

  @Patch(":id/billing")
  async updateBilling(req: Request, res: Response) {
    res.json(
      await updateOrganizationBillingForUser(
        res.locals.token,
        req.params.id,
        req.body
      )
    );
  }
}
