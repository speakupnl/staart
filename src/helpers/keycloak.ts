import { KEYCLOAK_BASE_URL, KEYCLOAK_CLIENT_ID } from "../config";
import axios from "axios";

export const keyCloakLoginWithUsernamePassword = async (
  username: string,
  password: string
) => {
  const params = new URLSearchParams();
  params.append("username", username);
  params.append("password", password);
  params.append("client_id", KEYCLOAK_CLIENT_ID);
  params.append("grant_type", "password");
  const result = await axios.post(
    `${KEYCLOAK_BASE_URL}/auth/realms/master/protocol/openid-connect/token`,
    params
  );
  return result.data;
};
