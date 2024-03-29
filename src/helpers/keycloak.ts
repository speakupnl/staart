import {
  KEYCLOAK_BASE_URL,
  KEYCLOAK_CLIENT_ID,
  KEYCLOAK_REALM,
  KEYCLOAK_USER_CLIENT_SECRET,
  KEYCLOAK_USER_CLIENT_ID
} from "../config";
import KcAdminClient from "keycloak-admin";
import UserRepresentation from "keycloak-admin/lib/defs/userRepresentation";
import { KeyValue } from "../interfaces/general";
import GroupRepresentation from "keycloak-admin/lib/defs/groupRepresentation";
import jwt, { decode } from "jsonwebtoken";
import { ErrorCode } from "../interfaces/enum";
import Axios from "axios";
import { stringify } from "query-string";
import { TokenUser } from "../interfaces/tables/user";

interface JWT {
  jti: string;
  iat: number;
  exp: number;
}

const speakHub = new KcAdminClient({
  baseUrl: KEYCLOAK_BASE_URL,
  realmName: "master"
});

const keyCloakTry = async (f: Function) => {
  await keyCloakAuthenticate();
  try {
    const data = await f();
    if (typeof data === "object" && Array.isArray(data))
      return { data, hasMore: false };
    return data;
  } catch (error) {
    if (error.response && error.response.status && error.response.data) {
      throw new Error(
        `${error.response.status}/${
          typeof error.response.data === "string"
            ? error.response.data
            : error.response.data.errorMessage || "internal-server-error"
        }`
      );
    }
    if (error.toString().includes("__SAFE__"))
      throw new Error(error.toString().replace("__SAFE__", ""));
    console.log("falling back", error);
    throw new Error("500/internal-server-error");
  }
};

export const keyCloakAuthenticate = async () => {
  const token = speakHub.getAccessToken();
  if (token) {
    const decoded = jwt.decode(token) as JWT;
    if (decoded.exp && decoded.exp * 1000 > new Date().getTime()) return;
  }
  await speakHub.auth({
    username: process.env.EXAMPLE_USERNAME as string,
    password: process.env.EXAMPLE_PASSWORD as string,
    grantType: "password",
    clientId: KEYCLOAK_CLIENT_ID
  });
};

export const keyCloakLoginUser = async (username: string, password: string) => {
  return await keyCloakTry(async () => {
    try {
      const result = await Axios.post(
        `${KEYCLOAK_BASE_URL}/realms/apidev/protocol/openid-connect/token`,
        stringify({
          grant_type: "password",
          client_id: KEYCLOAK_USER_CLIENT_ID,
          client_secret: KEYCLOAK_USER_CLIENT_SECRET,
          username,
          password
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        }
      );
      const data = result.data;
      if (!data.access_token) throw new Error();
      const userInfo = decode(data.access_token) as any;
      return {
        token: data.access_token,
        refresh: data.refresh_token,
        user:
          userInfo && userInfo.email
            ? await keyCloakGetUserByEmail(userInfo.email)
            : undefined
      };
    } catch (error) {
      console.log("Got", error);
      throw new Error(ErrorCode.INVALID_LOGIN);
    }
  });
};

export const keyCloakRefreshToken = async (token: string, username: string) => {
  return await keyCloakTry(async () => {
    try {
      const result = await Axios.post(
        `${KEYCLOAK_BASE_URL}/realms/apidev/protocol/openid-connect/token`,
        stringify({
          grant_type: "refresh_token",
          client_id: KEYCLOAK_USER_CLIENT_ID,
          client_secret: KEYCLOAK_USER_CLIENT_SECRET,
          refresh_token: token,
          username
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        }
      );
      const data = result.data;
      if (!data.access_token) throw new Error();
      const userInfo = decode(data.access_token) as any;
      return {
        token: data.access_token,
        refresh: data.refresh_token,
        user:
          userInfo && userInfo.email
            ? await keyCloakGetUserByEmail(userInfo.email)
            : undefined
      };
    } catch (error) {
      throw new Error(ErrorCode.INVALID_TOKEN);
    }
  });
};

export const keyCloakCreateUser = async (
  user: any
): Promise<{ id: string }> => {
  return await keyCloakTry(async () => {
    user.username = user.username || user.email;
    user.enabled = true;
    const password = user.password;
    delete user.password;
    const result = await speakHub.users.create({
      ...user,
      realm: KEYCLOAK_REALM,
      attributes: {
        createdBy: "staart"
      }
    });
    await keyCloakSendEmailVerificationToUser(result.id);
    if (password) await keyCloakUpdatePasswordOfUser(result.id, password);
    return result;
  });
};

export const keyCloakListUsers = async () => {
  return await keyCloakTry(async () => {
    return await speakHub.users.find({
      realm: KEYCLOAK_REALM
    });
  });
};

export const keyCloakGetUser = async (id: string) => {
  return await keyCloakTry(async () => {
    return await speakHub.users.findOne({
      id,
      realm: KEYCLOAK_REALM
    });
  });
};

export const keyCloakGetUserByEmail = async (
  email: string
): Promise<UserRepresentation> => {
  return await keyCloakTry(async () => {
    return (await speakHub.users.find({
      email,
      realm: KEYCLOAK_REALM
    }))[0];
  });
};

export const keyCloakUpdateUser = async (id: string, data: KeyValue) => {
  return await keyCloakTry(async () => {
    return await speakHub.users.update({ id, realm: KEYCLOAK_REALM }, data);
  });
};

export const keyCloakUpdatePasswordOfUser = async (
  id: string,
  newPassword: string
) => {
  return await keyCloakTry(async () => {
    return await speakHub.users.resetPassword({
      id,
      credential: {
        temporary: false,
        type: "password",
        value: newPassword
      },
      realm: KEYCLOAK_REALM
    });
  });
};

export const keyCloakSendEmailVerificationToUser = async (id: string) => {
  return await keyCloakTry(async () => {
    return await speakHub.users.sendVerifyEmail({ id, realm: KEYCLOAK_REALM });
  });
};

export const keyCloakDeleteUser = async (id: string) => {
  return await keyCloakTry(async () => {
    return await speakHub.users.del({ id, realm: KEYCLOAK_REALM });
  });
};

export const keyCloakGetUserGroups = async (
  id: string
): Promise<{ data: GroupRepresentation[] }> => {
  return await keyCloakTry(async () => {
    return await speakHub.users.listGroups({ id, realm: KEYCLOAK_REALM });
  });
};

export const keyCloakAddUserToGroup = async (id: string, groupId: string) => {
  return await keyCloakTry(async () => {
    return await speakHub.users.addToGroup({
      id,
      groupId,
      realm: KEYCLOAK_REALM
    });
  });
};

export const keyCloakRemoveUserFromGroup = async (
  id: string,
  groupId: string
) => {
  return await keyCloakTry(async () => {
    return await speakHub.users.delFromGroup({
      id,
      groupId,
      realm: KEYCLOAK_REALM
    });
  });
};

export const keyCloakListGroups = async () => {
  return await keyCloakTry(async () => {
    return await speakHub.groups.find({ realm: KEYCLOAK_REALM });
  });
};

export const keyCloakCreateGroup = async (
  group: GroupRepresentation
): Promise<{ id: string }> => {
  return await keyCloakTry(async () => {
    return await speakHub.groups.create({
      ...group,
      realm: KEYCLOAK_REALM,
      attributes: { createdBy: ["staart"] }
    });
  });
};

export const keyCloakGetGroup = async (
  id: string
): Promise<GroupRepresentation> => {
  return await keyCloakTry(async () => {
    return await speakHub.groups.findOne({ id, realm: KEYCLOAK_REALM });
  });
};

export const keyCloakGetGroupMembers = async (id: string) => {
  return await keyCloakTry(async () => {
    return await speakHub.groups.listMembers({ id, realm: KEYCLOAK_REALM });
  });
};

export const keyCloakUpdateGroup = async (id: string, data: KeyValue) => {
  return await keyCloakTry(async () => {
    return await speakHub.groups.update({ id, realm: KEYCLOAK_REALM }, data);
  });
};

export const keyCloakDeleteGroup = async (id: string) => {
  return await keyCloakTry(async () => {
    return await speakHub.groups.del({ id, realm: KEYCLOAK_REALM });
  });
};

export const keyCloakGetUserSessions = async (id: string) => {
  return await keyCloakTry(async () => {
    return (await Axios.get(
      `${KEYCLOAK_BASE_URL}/admin/realms/apidev/users/${id}/sessions`,
      {
        headers: {
          Authorization: `Bearer ${speakHub.getAccessToken()}`
        }
      }
    )).data;
  });
};

export const keyCloakGetTeamApplications = async (id: string) => {
  return await keyCloakTry(async () => {
    return (await Axios.get(
      `${KEYCLOAK_BASE_URL}/admin/realms/apidev/clients`,
      {
        headers: {
          Authorization: `Bearer ${speakHub.getAccessToken()}`
        }
      }
    )).data.filter(
      (application: any) =>
        typeof application === "object" &&
        application.attributes &&
        application.attributes.ownerGroup === id
    );
  });
};

export const keyCloakGetTeamApplication = async (
  id: string,
  applicationId: string
) => {
  return await keyCloakTry(async () => {
    const data = await Axios.get(
      `${KEYCLOAK_BASE_URL}/admin/realms/apidev/clients/${applicationId}`,
      {
        headers: {
          Authorization: `Bearer ${speakHub.getAccessToken()}`
        }
      }
    );
    if (
      data.data &&
      data.data.attributes &&
      data.data.attributes.ownerGroup === id
    )
      return data.data;
    throw new Error(ErrorCode.INSUFFICIENT_PERMISSION);
  });
};

export const keyCloakDeleteTeamApplication = async (
  id: string,
  applicationId: string
) => {
  return await keyCloakTry(async () => {
    await keyCloakGetTeamApplication(id, applicationId);
    return (await Axios.delete(
      `${KEYCLOAK_BASE_URL}/admin/realms/apidev/clients/${applicationId}`,
      {
        headers: {
          Authorization: `Bearer ${speakHub.getAccessToken()}`
        }
      }
    )).data;
  });
};

export const keyCloakCreateTeamApplication = async (
  id: string,
  data: KeyValue
) => {
  data = data || {};
  data.attributes = data.attributes || {};
  data.attributes.ownerGroup = id;
  return await keyCloakTry(async () => {
    return (await Axios.post(
      `${KEYCLOAK_BASE_URL}/admin/realms/apidev/clients`,
      data,
      {
        headers: {
          Authorization: `Bearer ${speakHub.getAccessToken()}`,
          "Content-Type": "application/json"
        }
      }
    )).data;
  });
};

export const keyCloakUpdateTeamApplication = async (
  id: string,
  applicationId: string,
  data: KeyValue
) => {
  data = data || {};
  data.attributes = data.attributes || {};
  data.attributes.ownerGroup = id;
  return await keyCloakTry(async () => {
    await keyCloakGetTeamApplication(id, applicationId);
    return (await Axios.put(
      `${KEYCLOAK_BASE_URL}/admin/realms/apidev/clients/${applicationId}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${speakHub.getAccessToken()}`,
          "Content-Type": "application/json"
        }
      }
    )).data;
  });
};

export const keyCloakGetTeamApplicationSecret = async (
  id: string,
  applicationId: string
) => {
  return await keyCloakTry(async () => {
    await keyCloakGetTeamApplication(id, applicationId);
    return (await Axios.get(
      `${KEYCLOAK_BASE_URL}/admin/realms/apidev/clients/${applicationId}/client-secret`,
      {
        headers: {
          Authorization: `Bearer ${speakHub.getAccessToken()}`
        }
      }
    )).data;
  });
};

export const keyCloakCreateTeamApplicationSecret = async (
  id: string,
  applicationId: string
) => {
  return await keyCloakTry(async () => {
    await keyCloakGetTeamApplication(id, applicationId);
    return (await Axios.post(
      `${KEYCLOAK_BASE_URL}/admin/realms/apidev/clients/${applicationId}/client-secret`,
      {},
      {
        headers: {
          Authorization: `Bearer ${speakHub.getAccessToken()}`,
          "Content-Type": "application/json"
        }
      }
    )).data;
  });
};

export const keyCloakGetTeamApplicationDefaultScopes = async (
  id: string,
  applicationId: string
) => {
  return await keyCloakTry(async () => {
    await keyCloakGetTeamApplication(id, applicationId);
    return (await Axios.get(
      `${KEYCLOAK_BASE_URL}/admin/realms/apidev/clients/${applicationId}/default-client-scopes`,
      {
        headers: {
          Authorization: `Bearer ${speakHub.getAccessToken()}`
        }
      }
    )).data;
  });
};

export const keyCloakUpdateTeamApplicationDefaultScopes = async (
  id: string,
  applicationId: string,
  clientScopeId: string
) => {
  return await keyCloakTry(async () => {
    await keyCloakGetTeamApplication(id, applicationId);
    return (await Axios.put(
      `${KEYCLOAK_BASE_URL}/admin/realms/apidev/clients/${applicationId}/${clientScopeId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${speakHub.getAccessToken()}`,
          "Content-Type": "application/json"
        }
      }
    )).data;
  });
};

export const keyCloakDeleteTeamApplicationDefaultScopes = async (
  id: string,
  applicationId: string,
  clientScopeId: string
) => {
  return await keyCloakTry(async () => {
    await keyCloakGetTeamApplication(id, applicationId);
    return (await Axios.delete(
      `${KEYCLOAK_BASE_URL}/admin/realms/apidev/clients/${applicationId}/${clientScopeId}`,
      {
        headers: {
          Authorization: `Bearer ${speakHub.getAccessToken()}`
        }
      }
    )).data;
  });
};

export const keyCloakGetTeamApplicationOfflineSessions = async (
  id: string,
  applicationId: string
) => {
  return await keyCloakTry(async () => {
    await keyCloakGetTeamApplication(id, applicationId);
    return (await Axios.get(
      `${KEYCLOAK_BASE_URL}/admin/realms/apidev/clients/${applicationId}/offline-sessions`,
      {
        headers: {
          Authorization: `Bearer ${speakHub.getAccessToken()}`
        }
      }
    )).data;
  });
};

export const keyCloakGetTeamApplicationOptionalScopes = async (
  id: string,
  applicationId: string
) => {
  return await keyCloakTry(async () => {
    await keyCloakGetTeamApplication(id, applicationId);
    return (await Axios.get(
      `${KEYCLOAK_BASE_URL}/admin/realms/apidev/clients/${applicationId}/optional-client-scopes`,
      {
        headers: {
          Authorization: `Bearer ${speakHub.getAccessToken()}`
        }
      }
    )).data;
  });
};

export const keyCloakUpdateTeamApplicationOptionalScopes = async (
  id: string,
  applicationId: string,
  clientScopeId: string
) => {
  return await keyCloakTry(async () => {
    await keyCloakGetTeamApplication(id, applicationId);
    return (await Axios.put(
      `${KEYCLOAK_BASE_URL}/admin/realms/apidev/clients/${applicationId}/${clientScopeId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${speakHub.getAccessToken()}`,
          "Content-Type": "application/json"
        }
      }
    )).data;
  });
};

export const keyCloakDeleteTeamApplicationOptionalScopes = async (
  id: string,
  applicationId: string,
  clientScopeId: string
) => {
  return await keyCloakTry(async () => {
    await keyCloakGetTeamApplication(id, applicationId);
    return (await Axios.delete(
      `${KEYCLOAK_BASE_URL}/admin/realms/apidev/clients/${applicationId}/${clientScopeId}`,
      {
        headers: {
          Authorization: `Bearer ${speakHub.getAccessToken()}`
        }
      }
    )).data;
  });
};
