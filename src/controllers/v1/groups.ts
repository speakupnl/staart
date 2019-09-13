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
  updateOrganizationBillingForUser,
  getOrganizationInvoicesForUser,
  getOrganizationInvoiceForUser,
  getOrganizationSourcesForUser,
  getOrganizationSourceForUser,
  getOrganizationSubscriptionsForUser,
  getOrganizationSubscriptionForUser,
  updateOrganizationSubscriptionForUser,
  createOrganizationSubscriptionForUser,
  getOrganizationPricingPlansForUser,
  createOrganizationSourceForUser,
  deleteOrganizationSourceForUser,
  updateOrganizationSourceForUser,
  getOrganizationApplicationsForUser,
  getOrganizationApplicationForUser,
  deleteOrganizationApplicationForUser,
  createOrganizationApplicationForUser,
  updateOrganizationApplicationForUser,
  getOrganizationApplicationSecretForUser,
  createOrganizationApplicationSecretForUser,
  getOrganizationApplicationDefaultScopesForUser,
  updateOrganizationApplicationDefaultScopesForUser,
  deleteOrganizationApplicationDefaultScopesForUser,
  deleteOrganizationApplicationOptionalScopesForUser,
  updateOrganizationApplicationOptionalScopesForUser,
  getOrganizationApplicationOptionalScopesForUser
} from "../../rest/group";
import { authHandler } from "../../helpers/middleware";
import asyncHandler from "express-async-handler";
import { joiValidate } from "../../helpers/utils";
import Joi from "@hapi/joi";
import { CREATED } from "http-status-codes";

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

  @Get(":id/invoices")
  async getInvoices(req: Request, res: Response) {
    const organizationId = req.params.id;
    joiValidate(
      { organizationId: Joi.string().required() },
      { organizationId }
    );
    const subscriptionParams = { ...req.query };
    joiValidate(
      {
        start: Joi.string(),
        billing: Joi.string().valid("charge_automatically", "send_invoice"),
        itemsPerPage: Joi.number(),
        plan: Joi.string(),
        status: Joi.string()
      },
      subscriptionParams
    );
    res.json(
      await getOrganizationInvoicesForUser(
        res.locals.token,
        organizationId,
        subscriptionParams
      )
    );
  }

  @Get(":id/invoices/:invoiceId")
  async getInvoice(req: Request, res: Response) {
    const organizationId = req.params.id;
    const invoiceId = req.params.invoiceId;
    joiValidate(
      {
        organizationId: Joi.string().required(),
        invoiceId: Joi.string().required()
      },
      { organizationId, invoiceId }
    );
    res.json(
      await getOrganizationInvoiceForUser(
        res.locals.token,
        organizationId,
        invoiceId
      )
    );
  }

  @Get(":id/subscriptions")
  async getSubscriptions(req: Request, res: Response) {
    const organizationId = req.params.id;
    joiValidate(
      { organizationId: Joi.string().required() },
      { organizationId }
    );
    const subscriptionParams = { ...req.query };
    joiValidate(
      {
        start: Joi.string(),
        billing: Joi.string().valid("charge_automatically", "send_invoice"),
        itemsPerPage: Joi.number(),
        plan: Joi.string(),
        status: Joi.string()
      },
      subscriptionParams
    );
    res.json(
      await getOrganizationSubscriptionsForUser(
        res.locals.token,
        organizationId,
        subscriptionParams
      )
    );
  }

  @Get(":id/subscriptions/:subscriptionId")
  async getSubscription(req: Request, res: Response) {
    const organizationId = req.params.id;
    const subscriptionId = req.params.subscriptionId;
    joiValidate(
      {
        organizationId: Joi.string().required(),
        subscriptionId: Joi.string().required()
      },
      { organizationId, subscriptionId }
    );
    res.json(
      await getOrganizationSubscriptionForUser(
        res.locals.token,
        organizationId,
        subscriptionId
      )
    );
  }

  @Patch(":id/subscriptions/:subscriptionId")
  async patchSubscription(req: Request, res: Response) {
    const organizationId = req.params.id;
    const subscriptionId = req.params.subscriptionId;
    const data = req.body;
    joiValidate(
      {
        organizationId: Joi.string().required(),
        subscriptionId: Joi.string().required()
      },
      { organizationId, subscriptionId }
    );
    joiValidate(
      {
        billing: Joi.string().valid("charge_automatically", "send_invoice"),
        cancel_at_period_end: Joi.boolean(),
        coupon: Joi.string(),
        default_source: Joi.string()
      },
      data
    );
    res.json(
      await updateOrganizationSubscriptionForUser(
        res.locals.token,
        organizationId,
        subscriptionId,
        data
      )
    );
  }

  @Put(":id/subscriptions")
  async putSubscriptions(req: Request, res: Response) {
    const organizationId = req.params.id;
    joiValidate(
      { organizationId: Joi.string().required() },
      { organizationId }
    );
    const subscriptionParams = { ...req.body };
    joiValidate(
      {
        plan: Joi.string().required(),
        billing: Joi.string().valid("charge_automatically", "send_invoice"),
        tax_percent: Joi.number(),
        number_of_seats: Joi.number()
      },
      subscriptionParams
    );
    res.json(
      await createOrganizationSubscriptionForUser(
        res.locals.token,
        organizationId,
        subscriptionParams
      )
    );
  }

  @Get(":id/pricing")
  async getPlans(req: Request, res: Response) {
    const organizationId = req.params.id;
    joiValidate(
      {
        organizationId: Joi.string().required()
      },
      { organizationId }
    );
    res.json(
      await getOrganizationPricingPlansForUser(res.locals.token, organizationId)
    );
  }

  @Get(":id/sources")
  async getSources(req: Request, res: Response) {
    const organizationId = req.params.id;
    joiValidate(
      { organizationId: Joi.string().required() },
      { organizationId }
    );
    const subscriptionParams = { ...req.query };
    joiValidate(
      {
        start: Joi.string(),
        itemsPerPage: Joi.number()
      },
      subscriptionParams
    );
    res.json(
      await getOrganizationSourcesForUser(
        res.locals.token,
        organizationId,
        subscriptionParams
      )
    );
  }

  @Get(":id/sources/:sourceId")
  async getSource(req: Request, res: Response) {
    const organizationId = req.params.id;
    const sourceId = req.params.sourceId;
    joiValidate(
      {
        organizationId: Joi.string().required(),
        sourceId: Joi.string().required()
      },
      { organizationId, sourceId }
    );
    res.json(
      await getOrganizationSourceForUser(
        res.locals.token,
        organizationId,
        sourceId
      )
    );
  }

  @Put(":id/sources")
  async putSources(req: Request, res: Response) {
    const organizationId = req.params.id;
    joiValidate(
      { organizationId: Joi.string().required() },
      { organizationId }
    );
    res
      .status(CREATED)
      .json(
        await createOrganizationSourceForUser(
          res.locals.token,
          organizationId,
          req.body
        )
      );
  }

  @Delete(":id/sources/:sourceId")
  async deleteSource(req: Request, res: Response) {
    const sourceId = req.params.sourceId;
    const organizationId = req.params.id;
    joiValidate(
      {
        organizationId: Joi.string().required(),
        sourceId: Joi.string().required()
      },
      { organizationId, sourceId }
    );
    res.json(
      await deleteOrganizationSourceForUser(
        res.locals.token,
        organizationId,
        sourceId
      )
    );
  }

  @Patch(":id/sources/:sourceId")
  async patchSource(req: Request, res: Response) {
    const sourceId = req.params.sourceId;
    const organizationId = req.params.id;
    joiValidate(
      {
        organizationId: Joi.string().required(),
        sourceId: Joi.string().required()
      },
      { organizationId, sourceId }
    );
    res.json(
      await updateOrganizationSourceForUser(
        res.locals.token,
        organizationId,
        sourceId,
        req.body
      )
    );
  }

  @Get(":id/applications")
  async getApplications(req: Request, res: Response) {
    const organizationId = req.params.id;
    joiValidate(
      { organizationId: Joi.string().required() },
      { organizationId }
    );
    res.json(
      await getOrganizationApplicationsForUser(res.locals.token, organizationId)
    );
  }

  @Put(":id/applications")
  async putApplications(req: Request, res: Response) {
    const organizationId = req.params.id;
    joiValidate(
      { organizationId: Joi.string().required() },
      { organizationId }
    );
    res
      .status(CREATED)
      .json(
        await createOrganizationApplicationForUser(
          res.locals.token,
          organizationId,
          req.body
        )
      );
  }

  @Get(":id/applications/:applicationId")
  async getApplication(req: Request, res: Response) {
    const organizationId = req.params.id;
    const applicationId = req.params.applicationId;
    joiValidate(
      {
        organizationId: Joi.string().required(),
        applicationId: Joi.string().required()
      },
      { organizationId, applicationId }
    );
    res.json(
      await getOrganizationApplicationForUser(
        res.locals.token,
        organizationId,
        applicationId
      )
    );
  }

  @Delete(":id/applications/:applicationId")
  async deleteApplication(req: Request, res: Response) {
    const applicationId = req.params.applicationId;
    const organizationId = req.params.id;
    joiValidate(
      {
        organizationId: Joi.string().required(),
        applicationId: Joi.string().required()
      },
      { organizationId, applicationId }
    );
    res.json(
      await deleteOrganizationApplicationForUser(
        res.locals.token,
        organizationId,
        applicationId
      )
    );
  }

  @Patch(":id/applications/:applicationId")
  async patchApplication(req: Request, res: Response) {
    const applicationId = req.params.applicationId;
    const organizationId = req.params.id;
    joiValidate(
      {
        organizationId: Joi.string().required(),
        applicationId: Joi.string().required()
      },
      { organizationId, applicationId }
    );
    res.json(
      await updateOrganizationApplicationForUser(
        res.locals.token,
        organizationId,
        applicationId,
        req.body
      )
    );
  }

  @Get(":id/applications/:applicationId/secret")
  async getApplicationSecret(req: Request, res: Response) {
    const organizationId = req.params.id;
    const applicationId = req.params.applicationId;
    joiValidate(
      {
        organizationId: Joi.string().required(),
        applicationId: Joi.string().required()
      },
      { organizationId, applicationId }
    );
    res.json(
      await getOrganizationApplicationSecretForUser(
        res.locals.token,
        organizationId,
        applicationId
      )
    );
  }

  @Put(":id/applications/:applicationId/secret")
  async putApplicationSecret(req: Request, res: Response) {
    const organizationId = req.params.id;
    const applicationId = req.params.applicationId;
    joiValidate(
      {
        organizationId: Joi.string().required(),
        applicationId: Joi.string().required()
      },
      { organizationId, applicationId }
    );
    res.json(
      await createOrganizationApplicationSecretForUser(
        res.locals.token,
        organizationId,
        applicationId
      )
    );
  }

  @Get(":id/applications/:applicationId/default-scopes")
  async getApplicationDefaultScopes(req: Request, res: Response) {
    const organizationId = req.params.id;
    const applicationId = req.params.applicationId;
    joiValidate(
      {
        organizationId: Joi.string().required(),
        applicationId: Joi.string().required()
      },
      { organizationId, applicationId }
    );
    res.json(
      await getOrganizationApplicationDefaultScopesForUser(
        res.locals.token,
        organizationId,
        applicationId
      )
    );
  }

  @Put(":id/applications/:applicationId/default-scopes/:scopeId")
  async putApplicationDefaultScopes(req: Request, res: Response) {
    const organizationId = req.params.id;
    const applicationId = req.params.applicationId;
    const scopeId = req.params.scopeId;
    joiValidate(
      {
        organizationId: Joi.string().required(),
        applicationId: Joi.string().required(),
        scopeId: Joi.string().required()
      },
      { organizationId, applicationId, scopeId }
    );
    res.json(
      await updateOrganizationApplicationDefaultScopesForUser(
        res.locals.token,
        organizationId,
        applicationId,
        scopeId
      )
    );
  }

  @Delete(":id/applications/:applicationId/default-scopes/:scopeId")
  async deleteApplicationDefaultScopes(req: Request, res: Response) {
    const organizationId = req.params.id;
    const applicationId = req.params.applicationId;
    const scopeId = req.params.scopeId;
    joiValidate(
      {
        organizationId: Joi.string().required(),
        applicationId: Joi.string().required(),
        scopeId: Joi.string().required()
      },
      { organizationId, applicationId, scopeId }
    );
    res.json(
      await deleteOrganizationApplicationDefaultScopesForUser(
        res.locals.token,
        organizationId,
        applicationId,
        scopeId
      )
    );
  }

  @Get(":id/applications/:applicationId/optional-scopes")
  async getApplicationOptionalScopes(req: Request, res: Response) {
    const organizationId = req.params.id;
    const applicationId = req.params.applicationId;
    joiValidate(
      {
        organizationId: Joi.string().required(),
        applicationId: Joi.string().required()
      },
      { organizationId, applicationId }
    );
    res.json(
      await getOrganizationApplicationOptionalScopesForUser(
        res.locals.token,
        organizationId,
        applicationId
      )
    );
  }

  @Put(":id/applications/:applicationId/optional-scopes/:scopeId")
  async putApplicationOptionalScopes(req: Request, res: Response) {
    const organizationId = req.params.id;
    const applicationId = req.params.applicationId;
    const scopeId = req.params.scopeId;
    joiValidate(
      {
        organizationId: Joi.string().required(),
        applicationId: Joi.string().required(),
        scopeId: Joi.string().required()
      },
      { organizationId, applicationId, scopeId }
    );
    res.json(
      await updateOrganizationApplicationOptionalScopesForUser(
        res.locals.token,
        organizationId,
        applicationId,
        scopeId
      )
    );
  }

  @Delete(":id/applications/:applicationId/optional-scopes/:scopeId")
  async deleteApplicationOptionalScopes(req: Request, res: Response) {
    const organizationId = req.params.id;
    const applicationId = req.params.applicationId;
    const scopeId = req.params.scopeId;
    joiValidate(
      {
        organizationId: Joi.string().required(),
        applicationId: Joi.string().required(),
        scopeId: Joi.string().required()
      },
      { organizationId, applicationId, scopeId }
    );
    res.json(
      await deleteOrganizationApplicationOptionalScopesForUser(
        res.locals.token,
        organizationId,
        applicationId,
        scopeId
      )
    );
  }
}
