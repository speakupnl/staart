export interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility?: "public" | "private";
}

export interface KeyCloakLoginResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_expires_in: number;
  token_type: "bearer";
  "not-before-policy": number;
  session_state: string;
  scope: string;
}

export interface KeyCloakUserResponse {
  sub: string;
  email_verified: boolean;
  name?: string;
  preferred_username: string;
  given_name?: string;
  family_name?: string;
  email?: string;
}
