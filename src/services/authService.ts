import { LoginResponse, RefreshTokenResponse, OTPResponse, PhoneLoginResponse, User } from '@/types/auth';
import { parseJWT, decodeUrlToken, validateUrlToken, type UrlTokenPayload } from '@/utils/authUtils';
import { VITE_API_BASE , WORKFLOW_URL } from '@/config';

const API_BASE = VITE_API_BASE || 'https://innov-dev.beta.injomo.com';

class AuthService {
  // Email/Password Login
  async login(email: string, password: string): Promise<User> {
    const myHeaders = new Headers();
    myHeaders.append('Authorization', "Basic "+ btoa(email+':'+password)  );

    const formdata = new FormData();
    formdata.append('op', 'user.jwt.externalauth');

    const response = await fetch(`${API_BASE}/sys/api.v1`, {
      method: 'POST',
      headers: myHeaders,
      body: formdata,
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    const result: LoginResponse = await response.json();
    
    if (result.Status[0] !== 200) {
      throw new Error(result.Status[1] || 'Login failed');
    }

    // Store tokens
    this.setTokens(result.Body.JWTtoken, result.Body.refresh_token);

    // Return user data
    return {
      id: result.Body.Id,
      firstName: result.Body.FirstName,
      lastName: result.Body.LastName,
      email: result.Body.Email,
    };
  }

  // Generate OTP for WhatsApp
  async generateOTP(phone: string): Promise<void> {
    const formdata = new FormData();
    formdata.append('action', 'generate');
    formdata.append('phone', phone);

    const response = await fetch(`${API_BASE}/workflow.trigger/generateotp673fcc819ee01`, {
      method: 'POST',
      body: formdata,
    });

    if (!response.ok) {
      throw new Error('Failed to send OTP');
    }

    const result: OTPResponse = await response.json();
    
    if (result[0]["error"] !== "False") {
      throw new Error(result[0].message || 'Failed to generate OTP');
    }
  }

  // Validate OTP and Login with Phone
  async loginWithPhone(phone: string, otp: string): Promise<User> {
    const formdata = new FormData();
    formdata.append('OTP', otp);
    formdata.append('phone', phone);

    const response = await fetch(`${API_BASE}/workflow.trigger/checkotp673e598a41b66`, {
      method: 'POST',
      body: formdata,
    });

    const result: PhoneLoginResponse = await response.json();

    if (result[0]["authStatus"] == "False") {
      throw new Error(result[0].message || 'Failed to validate OTP');
    }

    // Store tokens
    this.setTokens(result[0].JWTtoken, result[0].refresh_token);

    // Return user data
    return {
      id: result[0].ID,
      firstName: result[0].FirstName,
      lastName: result[0].LastName,
      email: result[0].Email,
    };
  }

  // Refresh Access Token
  async refreshAccessToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    const JWTtoken = this.getToken();  
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const myHeaders = new Headers();
    myHeaders.append('Authorization', "Bearer "+ JWTtoken);

    const formdata = new FormData();
    formdata.append('op', 'user.jwt.regentoken');
    formdata.append('args[refresh_token]', refreshToken);

    const response = await fetch(`${API_BASE}/sys/api.v1`, {
      method: 'POST',
      headers: myHeaders,
      body: formdata,
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const result: RefreshTokenResponse = await response.json();
    
    if (result.Status[0] !== 200) {
      throw new Error(result.Status[1] || 'Token refresh failed');
    }

    // Store new JWT token
    localStorage.setItem('jwtToken', result.Body.JWTtoken);

    return result.Body.JWTtoken;
  }

  // Token Management
  setTokens(jwtToken: string, refreshToken: string): void {
    localStorage.setItem('jwtToken', jwtToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  getToken(): string | null {
    return localStorage.getItem('jwtToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  clearTokens(): void {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('refreshToken');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Check if token is valid and not expired
    const decoded = parseJWT(token);
    if (!decoded) return false;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp > currentTime;
  }

  getCurrentUser(): User | null {
    const token = this.getToken();
    if (!token) return null;

    const decoded = parseJWT(token);
    if (!decoded) return null;

    return {
      id: parseInt(decoded.uid),
      firstName: decoded.fname.trim(),
      lastName: '',
      email: decoded.email,
    };
  }

  // Authenticate using URL token
  async loginWithUrlToken(base64Token: string): Promise<User> {
    const payload = decodeUrlToken(base64Token);
    
    if (!payload) {
      throw new Error('Invalid token format');
    }
    
    if (!validateUrlToken(payload)) {
      throw new Error('Token validation failed or expired');
    }
    
    // Store the REAL tokens from the API response
    this.setTokens(payload.JWTtoken, payload.refresh_token);
    
    // Optionally store additional metadata
    localStorage.setItem('tenantId', payload.TenantId.toString());
    localStorage.setItem('chatWorkflow', payload.ChatWorkflow);
    localStorage.setItem('externalSocketServer', payload.ExternalSocketServer);
    
    return {
      id: payload.Id,
      firstName: payload.FirstName,
      lastName: payload.LastName,
      email: payload.Email,
      tenantId: payload.TenantId,
    };
  }
}

export const authService = new AuthService();
