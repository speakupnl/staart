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
      throw new Error(ErrorCode.INVALID_LOGIN);
    }
  });
};

export const keyCloakCreateUser = async (user: any) => {
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
    await keyCloakUpdatePasswordOfUser(result.id, password);
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

export const keyCloakGetUserGroups = async (id: string) => {
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
      attributes: { createdBy: "staart" }
    });
  });
};

export const keyCloakGetGroup = async (id: string) => {
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
