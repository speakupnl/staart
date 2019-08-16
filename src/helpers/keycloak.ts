import { KEYCLOAK_BASE_URL, KEYCLOAK_CLIENT_ID } from "../config";
import KcAdminClient from "keycloak-admin";
import axios from "axios";

const speakHub = new KcAdminClient({
  baseUrl: KEYCLOAK_BASE_URL
});
console.log("Connecting to", KEYCLOAK_BASE_URL);

export const keyCloakListUsers = async () => {
  await speakHub.auth({
    username: process.env.EXAMPLE_USERNAME as string,
    password: process.env.EXAMPLE_PASSWORD as string,
    grantType: "password",
    clientId: KEYCLOAK_CLIENT_ID
  });
  return {};
  // const users = await speakHub.users.find();
  // return users;
};

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
