import { KeyValue } from "../interfaces/general";
import {
  keyCloakListGroups,
  keyCloakGetGroup,
  keyCloakUpdateGroup,
  keyCloakDeleteGroup,
  keyCloakCreateGroup,
  keyCloakAddUserToGroup,
  keyCloakRemoveUserFromGroup,
  keyCloakGetGroupMembers,
  keyCloakGetUserByEmail,
  keyCloakCreateUser,
  keyCloakGetTeamApplications,
  keyCloakGetTeamApplication,
  keyCloakDeleteTeamApplication
} from "../helpers/keycloak";
import { can } from "../helpers/authorization";
import { OrgScopes, AdminScopes, ErrorCode } from "../interfaces/enum";
import { TokenUser } from "../interfaces/tables/user";
import UserRepresentation from "keycloak-admin/lib/defs/userRepresentation";
import { resetPasswordForUser } from "./user";
import {
  getStripeCustomer,
  updateStripeCustomer,
  createStripeCustomer,
  getStripeInvoices,
  getStripeInvoice,
  getStripeSources,
  getStripeSource,
  getStripeSubscriptions,
  getStripeSubscription,
  updateStripeSubscription,
  createStripeSubscription,
  getStripeProductPricing,
  deleteStripeSource,
  updateStripeSource,
  createStripeSource
} from "../crud/billing";

export const listGroupsForUser = async (tokenUser: TokenUser) => {
  await can(tokenUser, AdminScopes.READ_ALL_USERS, "admin");
  return await keyCloakListGroups();
};

export const createGroupForUser = async (
  tokenUser: TokenUser,
  data: KeyValue
) => {
  await can(tokenUser, OrgScopes.CREATE_ORG, "group");
  const result = await keyCloakCreateGroup(data);
  await keyCloakAddUserToGroup(tokenUser.id, result.id);
  return result;
};

export const getGroupForUser = async (tokenUser: TokenUser, id: string) => {
  await can(tokenUser, OrgScopes.READ_ORG, "group", id);
  return await keyCloakGetGroup(id);
};

export const getGroupMembersForUser = async (
  tokenUser: TokenUser,
  id: string
) => {
  await can(tokenUser, OrgScopes.READ_ORG, "group", id);
  return await keyCloakGetGroupMembers(id);
};

export const updateGroupForUser = async (
  tokenUser: TokenUser,
  id: string,
  data: KeyValue
) => {
  await can(tokenUser, OrgScopes.UPDATE_ORG, "group", id);
  // Users should not be able to edit their customer ID
  if (data.attributes && data.attributes.stripeCustomerId)
    delete data.attributes.stripeCustomerId;
  // Make sure you don't delete any pre-existing attributes
  const attributes = {
    ...(await keyCloakGetGroup(id)).attributes,
    ...(data.attributes || {})
  };
  data.attributes = attributes;
  await keyCloakUpdateGroup(id, data);
  return { updated: true, message: "user-updated" };
};

export const deleteGroupForUser = async (tokenUser: TokenUser, id: string) => {
  await can(tokenUser, OrgScopes.DELETE_ORG, "group", id);
  await keyCloakDeleteGroup(id);
  return { deleted: true, message: "user-deleted" };
};

export const addUserToGroupForUser = async (
  tokenUser: TokenUser,
  id: string,
  userId: string
) => {
  await can(tokenUser, OrgScopes.CREATE_ORG_MEMBERSHIPS, "group", id);
  return await keyCloakAddUserToGroup(userId, id);
};

export const addUserToGroupByNameEmailForUser = async (
  tokenUser: TokenUser,
  id: string,
  email: string,
  firstName: string,
  lastName: string
) => {
  await can(tokenUser, OrgScopes.CREATE_ORG_MEMBERSHIPS, "group", id);
  let user: UserRepresentation | null = null;
  try {
    user = await keyCloakGetUserByEmail(email);
  } catch (error) {}
  if (user && user.id) {
    return await keyCloakAddUserToGroup(user.id, id);
  } else {
    // create new user
    const newUser = await keyCloakCreateUser({
      email,
      firstName,
      lastName
    });
    await resetPasswordForUser(email);
    return await keyCloakAddUserToGroup(newUser.id, id);
  }
};

export const removeUserFromGroupForUser = async (
  tokenUser: TokenUser,
  id: string,
  userId: string
) => {
  await can(tokenUser, OrgScopes.CREATE_ORG_MEMBERSHIPS, "group", id);
  return await keyCloakRemoveUserFromGroup(userId, id);
};

export const getOrganizationBillingForUser = async (
  tokenUser: TokenUser,
  organizationId: string
) => {
  if (
    await can(tokenUser, OrgScopes.READ_ORG_BILLING, "group", organizationId)
  ) {
    const organization = await keyCloakGetGroup(organizationId);
    if (
      organization.attributes &&
      organization.attributes.stripeCustomerId &&
      organization.attributes.stripeCustomerId.length
    )
      return await getStripeCustomer(
        organization.attributes.stripeCustomerId[0]
      );
    throw new Error(ErrorCode.STRIPE_NO_CUSTOMER);
  }
  throw new Error(ErrorCode.INSUFFICIENT_PERMISSION);
};

export const updateOrganizationBillingForUser = async (
  tokenUser: TokenUser,
  organizationId: string,
  data: any
) => {
  if (
    await can(tokenUser, OrgScopes.UPDATE_ORG_BILLING, "group", organizationId)
  ) {
    const organization = await keyCloakGetGroup(organizationId);
    if (
      organization.attributes &&
      organization.attributes.stripeCustomerId &&
      organization.attributes.stripeCustomerId.length
    ) {
      return await updateStripeCustomer(
        organization.attributes.stripeCustomerId[0],
        data
      );
    } else {
      return await createStripeCustomer(organizationId, data);
    }
  }
  throw new Error(ErrorCode.INSUFFICIENT_PERMISSION);
};

export const getOrganizationInvoicesForUser = async (
  tokenUser: TokenUser,
  organizationId: string,
  params: KeyValue
) => {
  if (
    await can(tokenUser, OrgScopes.READ_ORG_INVOICES, "group", organizationId)
  ) {
    const organization = await keyCloakGetGroup(organizationId);
    if (
      organization.attributes &&
      organization.attributes.stripeCustomerId &&
      organization.attributes.stripeCustomerId.length
    )
      return await getStripeInvoices(
        organization.attributes.stripeCustomerId[0],
        params
      );
    throw new Error(ErrorCode.STRIPE_NO_CUSTOMER);
  }
  throw new Error(ErrorCode.INSUFFICIENT_PERMISSION);
};

export const getOrganizationInvoiceForUser = async (
  tokenUser: TokenUser,
  organizationId: string,
  invoiceId: string
) => {
  if (
    await can(tokenUser, OrgScopes.READ_ORG_INVOICES, "group", organizationId)
  ) {
    const organization = await keyCloakGetGroup(organizationId);
    if (
      organization.attributes &&
      organization.attributes.stripeCustomerId &&
      organization.attributes.stripeCustomerId.length
    )
      return await getStripeInvoice(
        organization.attributes.stripeCustomerId[0],
        invoiceId
      );
    throw new Error(ErrorCode.STRIPE_NO_CUSTOMER);
  }
  throw new Error(ErrorCode.INSUFFICIENT_PERMISSION);
};

export const getOrganizationSourcesForUser = async (
  tokenUser: TokenUser,
  organizationId: string,
  params: KeyValue
) => {
  if (
    await can(tokenUser, OrgScopes.READ_ORG_SOURCES, "group", organizationId)
  ) {
    const organization = await keyCloakGetGroup(organizationId);
    if (
      organization.attributes &&
      organization.attributes.stripeCustomerId &&
      organization.attributes.stripeCustomerId.length
    )
      return await getStripeSources(
        organization.attributes.stripeCustomerId[0],
        params
      );
    throw new Error(ErrorCode.STRIPE_NO_CUSTOMER);
  }
  throw new Error(ErrorCode.INSUFFICIENT_PERMISSION);
};

export const getOrganizationSourceForUser = async (
  tokenUser: TokenUser,
  organizationId: string,
  sourceId: string
) => {
  if (
    await can(tokenUser, OrgScopes.READ_ORG_SOURCES, "group", organizationId)
  ) {
    const organization = await keyCloakGetGroup(organizationId);
    if (
      organization.attributes &&
      organization.attributes.stripeCustomerId &&
      organization.attributes.stripeCustomerId.length
    )
      return await getStripeSource(
        organization.attributes.stripeCustomerId[0],
        sourceId
      );
    throw new Error(ErrorCode.STRIPE_NO_CUSTOMER);
  }
  throw new Error(ErrorCode.INSUFFICIENT_PERMISSION);
};

export const getOrganizationSubscriptionsForUser = async (
  tokenUser: TokenUser,
  organizationId: string,
  params: KeyValue
) => {
  if (
    await can(
      tokenUser,
      OrgScopes.READ_ORG_SUBSCRIPTIONS,
      "group",
      organizationId
    )
  ) {
    const organization = await keyCloakGetGroup(organizationId);
    if (
      organization.attributes &&
      organization.attributes.stripeCustomerId &&
      organization.attributes.stripeCustomerId.length
    )
      return await getStripeSubscriptions(
        organization.attributes.stripeCustomerId[0],
        params
      );
    throw new Error(ErrorCode.STRIPE_NO_CUSTOMER);
  }
  throw new Error(ErrorCode.INSUFFICIENT_PERMISSION);
};

export const getOrganizationSubscriptionForUser = async (
  tokenUser: TokenUser,
  organizationId: string,
  subscriptionId: string
) => {
  if (
    await can(
      tokenUser,
      OrgScopes.READ_ORG_SUBSCRIPTIONS,
      "group",
      organizationId
    )
  ) {
    const organization = await keyCloakGetGroup(organizationId);
    if (
      organization.attributes &&
      organization.attributes.stripeCustomerId &&
      organization.attributes.stripeCustomerId.length
    )
      return await getStripeSubscription(
        organization.attributes.stripeCustomerId[0],
        subscriptionId
      );
    throw new Error(ErrorCode.STRIPE_NO_CUSTOMER);
  }
  throw new Error(ErrorCode.INSUFFICIENT_PERMISSION);
};

export const updateOrganizationSubscriptionForUser = async (
  tokenUser: TokenUser,
  organizationId: string,
  subscriptionId: string,
  data: KeyValue
) => {
  if (
    await can(
      tokenUser,
      OrgScopes.UPDATE_ORG_SUBSCRIPTIONS,
      "group",
      organizationId
    )
  ) {
    const organization = await keyCloakGetGroup(organizationId);
    if (
      organization.attributes &&
      organization.attributes.stripeCustomerId &&
      organization.attributes.stripeCustomerId.length
    ) {
      const result = await updateStripeSubscription(
        organization.attributes.stripeCustomerId[0],
        subscriptionId,
        data
      );
      return result;
    }
    throw new Error(ErrorCode.STRIPE_NO_CUSTOMER);
  }
  throw new Error(ErrorCode.INSUFFICIENT_PERMISSION);
};

export const createOrganizationSubscriptionForUser = async (
  tokenUser: TokenUser,
  organizationId: string,
  params: { plan: string; [index: string]: any }
) => {
  if (
    await can(
      tokenUser,
      OrgScopes.CREATE_ORG_SUBSCRIPTIONS,
      "group",
      organizationId
    )
  ) {
    const organization = await keyCloakGetGroup(organizationId);
    if (
      organization.attributes &&
      organization.attributes.stripeCustomerId &&
      organization.attributes.stripeCustomerId.length
    ) {
      const result = await createStripeSubscription(
        organization.attributes.stripeCustomerId[0],
        params
      );
      return result;
    }
    throw new Error(ErrorCode.STRIPE_NO_CUSTOMER);
  }
  throw new Error(ErrorCode.INSUFFICIENT_PERMISSION);
};

export const getOrganizationPricingPlansForUser = async (
  tokenUser: TokenUser,
  organizationId: string
) => {
  if (await can(tokenUser, OrgScopes.READ_ORG_PLANS, "group", organizationId))
    return await getStripeProductPricing();
  throw new Error(ErrorCode.INSUFFICIENT_PERMISSION);
};

export const deleteOrganizationSourceForUser = async (
  tokenUser: TokenUser,
  organizationId: string,
  sourceId: string
) => {
  if (
    await can(tokenUser, OrgScopes.DELETE_ORG_SOURCES, "group", organizationId)
  ) {
    const organization = await keyCloakGetGroup(organizationId);
    if (
      organization.attributes &&
      organization.attributes.stripeCustomerId &&
      organization.attributes.stripeCustomerId.length
    ) {
      const result = await deleteStripeSource(
        organization.attributes.stripeCustomerId[0],
        sourceId
      );
      return result;
    }
    throw new Error(ErrorCode.STRIPE_NO_CUSTOMER);
  }
  throw new Error(ErrorCode.INSUFFICIENT_PERMISSION);
};

export const updateOrganizationSourceForUser = async (
  tokenUser: TokenUser,
  organizationId: string,
  sourceId: string,
  data: any
) => {
  if (
    await can(tokenUser, OrgScopes.UPDATE_ORG_SOURCES, "group", organizationId)
  ) {
    const organization = await keyCloakGetGroup(organizationId);
    if (
      organization.attributes &&
      organization.attributes.stripeCustomerId &&
      organization.attributes.stripeCustomerId.length
    ) {
      const result = await updateStripeSource(
        organization.attributes.stripeCustomerId[0],
        sourceId,
        data
      );
      return result;
    }
    throw new Error(ErrorCode.STRIPE_NO_CUSTOMER);
  }
  throw new Error(ErrorCode.INSUFFICIENT_PERMISSION);
};

export const createOrganizationSourceForUser = async (
  tokenUser: TokenUser,
  organizationId: string,
  card: any
) => {
  if (
    await can(tokenUser, OrgScopes.CREATE_ORG_SOURCES, "group", organizationId)
  ) {
    const organization = await keyCloakGetGroup(organizationId);
    if (
      organization.attributes &&
      organization.attributes.stripeCustomerId &&
      organization.attributes.stripeCustomerId.length
    ) {
      const result = await createStripeSource(
        organization.attributes.stripeCustomerId[0],
        card
      );
      return result;
    }
    throw new Error(ErrorCode.STRIPE_NO_CUSTOMER);
  }
  throw new Error(ErrorCode.INSUFFICIENT_PERMISSION);
};

export const getOrganizationApplicationsForUser = async (
  tokenUser: TokenUser,
  organizationId: string
) => {
  if (
    await can(tokenUser, OrgScopes.READ_ORG_API_KEYS, "group", organizationId)
  )
    return await keyCloakGetTeamApplications(organizationId);
  throw new Error(ErrorCode.INSUFFICIENT_PERMISSION);
};

export const getOrganizationApplicationForUser = async (
  tokenUser: TokenUser,
  organizationId: string,
  applicationId: string
) => {
  if (
    await can(tokenUser, OrgScopes.READ_ORG_API_KEYS, "group", organizationId)
  )
    return await keyCloakGetTeamApplication(organizationId, applicationId);
  throw new Error(ErrorCode.INSUFFICIENT_PERMISSION);
};

export const deleteOrganizationApplicationForUser = async (
  tokenUser: TokenUser,
  organizationId: string,
  applicationId: string
) => {
  if (
    await can(tokenUser, OrgScopes.DELETE_ORG_API_KEYS, "group", organizationId)
  )
    return await keyCloakDeleteTeamApplication(organizationId, applicationId);
  throw new Error(ErrorCode.INSUFFICIENT_PERMISSION);
};
