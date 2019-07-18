import {
  query,
  tableValues,
  setValues,
  removeReadOnlyValues,
  tableName
} from "../helpers/mysql";
import { Organization } from "../interfaces/tables/organization";
import { capitalizeFirstAndLastLetter, createSlug } from "../helpers/utils";
import { KeyValue } from "../interfaces/general";
import { cachedQuery, deleteItemFromCache } from "../helpers/cache";
import { CacheCategories, ErrorCode } from "../interfaces/enum";
import { ApiKey } from "../interfaces/tables/organization";
import { getPaginatedData } from "./data";
import { apiKeyToken } from "../helpers/jwt";
import { TOKEN_EXPIRY_API_KEY_MAX } from "../config";

/*
 * Create a new organization for a user
 */
export const createOrganization = async (organization: Organization) => {
  if (!organization.name) throw new Error(ErrorCode.INVALID_INPUT);
  organization.name = capitalizeFirstAndLastLetter(organization.name);
  organization.createdAt = new Date();
  organization.updatedAt = organization.createdAt;
  organization.username = createSlug(organization.name);
  // Create organization
  return await query(
    `INSERT INTO ${tableName("organizations")} ${tableValues(organization)}`,
    Object.values(organization)
  );
};

/*
 * Get the details of a specific organization
 */
export const getOrganization = async (id: number) => {
  const org = (<Organization[]>(
    await cachedQuery(
      CacheCategories.ORGANIZATION,
      id,
      `SELECT * FROM ${tableName("organizations")} WHERE id = ? LIMIT 1`,
      [id]
    )
  ))[0];
  if (org) return org;
  throw new Error(ErrorCode.ORGANIZATION_NOT_FOUND);
};

/*
 * Get the details of a specific organization
 */
export const getOrganizationIdFromUsername = async (username: string) => {
  const org = (<Organization[]>(
    await cachedQuery(
      CacheCategories.ORGANIZATION_USERNAME,
      username,
      `SELECT id FROM ${tableName("organizations")} WHERE username = ? LIMIT 1`,
      [username]
    )
  ))[0];
  if (org && org.id) return org.id;
  throw new Error(ErrorCode.ORGANIZATION_NOT_FOUND);
};

/*
 * Update an organization
 */
export const updateOrganization = async (
  id: number,
  organization: KeyValue
) => {
  organization.updatedAt = new Date();
  organization = removeReadOnlyValues(organization);
  const originalOrganization = await getOrganization(id);
  if (organization.username && originalOrganization.username) {
    const currentOwner = await getOrganizationIdFromUsername(
      originalOrganization.username
    );
    if (currentOwner != id) throw new Error(ErrorCode.USERNAME_EXISTS);
  }
  deleteItemFromCache(CacheCategories.ORGANIZATION, id);
  return await query(
    `UPDATE ${tableName("organizations")} SET ${setValues(
      organization
    )} WHERE id = ?`,
    [...Object.values(organization), id]
  );
};

/*
 * Delete an organization
 */
export const deleteOrganization = async (id: number) => {
  deleteItemFromCache(CacheCategories.ORGANIZATION, id);
  return await query(`DELETE FROM ${tableName("organizations")} WHERE id = ?`, [
    id
  ]);
};

/*
 * Get all ${tableName("organizations")}
 */
export const getAllOrganizations = async () => {
  return <Organization[]>(
    await query(`SELECT * FROM ${tableName("organizations")}`)
  );
};

/**
 * Get a list of all approved locations of a user
 */
export const getOrganizationApiKeys = async (
  organizationId: number,
  query: KeyValue
) => {
  return await getPaginatedData({
    table: "api-keys",
    conditions: {
      organizationId
    },
    ...query
  });
};

/**
 * Get an API key
 */
export const getApiKey = async (organizationId: number, apiKeyId: number) => {
  return (<ApiKey[]>(
    await cachedQuery(
      CacheCategories.API_KEY_ORG,
      `${organizationId}_${apiKeyId}`,
      `SELECT * FROM ${tableName(
        "api-keys"
      )} WHERE id = ? AND organizationId = ? LIMIT 1`,
      [apiKeyId, organizationId]
    )
  ))[0];
};

/**
 * Create an API key
 */
export const createApiKey = async (apiKey: ApiKey) => {
  apiKey.expiresAt = apiKey.expiresAt || new Date(TOKEN_EXPIRY_API_KEY_MAX);
  apiKey.createdAt = new Date();
  apiKey.updatedAt = apiKey.createdAt;
  apiKey.jwtApiKey = await apiKeyToken(apiKey);
  return await query(
    `INSERT INTO ${tableName("api-keys")} ${tableValues(apiKey)}`,
    Object.values(apiKey)
  );
};

/**
 * Update a user's details
 */
export const updateApiKey = async (
  organizationId: number,
  apiKeyId: number,
  data: KeyValue
) => {
  data.updatedAt = new Date();
  data = removeReadOnlyValues(data);
  const apiKey = await getApiKey(organizationId, apiKeyId);
  data.jwtApiKey = await apiKeyToken({ ...apiKey, ...data });
  deleteItemFromCache(CacheCategories.API_KEY, apiKeyId);
  deleteItemFromCache(
    CacheCategories.API_KEY_ORG,
    `${organizationId}_${apiKeyId}`
  );
  return await query(
    `UPDATE ${tableName("api-keys")} SET ${setValues(
      data
    )} WHERE id = ? AND organizationId = ?`,
    [...Object.values(data), apiKeyId, organizationId]
  );
};

/**
 * Delete an API key
 */
export const deleteApiKey = async (
  organizationId: number,
  apiKeyId: number
) => {
  deleteItemFromCache(CacheCategories.API_KEY, apiKeyId);
  deleteItemFromCache(
    CacheCategories.API_KEY_ORG,
    `${organizationId}_${apiKeyId}`
  );
  return await query(
    `DELETE FROM ${tableName(
      "api-keys"
    )} WHERE id = ? AND organizationId = ? LIMIT 1`,
    [apiKeyId, organizationId]
  );
};
