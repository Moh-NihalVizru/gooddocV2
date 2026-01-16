export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  tenantId?: number;
}

export interface LoginResponse {
  Status: [number, string];
  Body: {
    Id: number;
    FirstName: string;
    LastName: string;
    Email: string;
    JWTtoken: string;
    refresh_token: string;
  };
}

export interface RefreshTokenResponse {
  Status: [number, string];
  Body: {
    JWTtoken: string;
  };
}

export interface OTPResponse {
  [key: number]: {
    error: string;
    message?: string;
  };
}

export interface PhoneLoginResponse {
  [key: number]: {
    authStatus: string;
    message?: string;
    JWTtoken: string;
    refresh_token: string;
    ID: number;
    FirstName: string;
    LastName: string;
    Email: string;
  };
}

export interface UrlTokenPayload {
  Id: number;
  FirstName: string;
  LastName: string;
  Email: string;
  JWTtoken: string;
  refresh_token: string;
  TenantId: number;
  ChatWorkflow: string;
  ExternalSocketServer: string;
  exp?: number;
}
