/* eslint-disable @typescript-eslint/no-explicit-any */

import { authService } from './authService';
import { WORKFLOW_URL , VITE_API_BASE } from '@/config';

const API_BASE = WORKFLOW_URL ;

interface ApiResponse<T> {
  data?: T;
  error?: string;
  retriable?: boolean;
  rawResponse?: string;
}


export async function postToWorkflow<T>(
  endpoint: string,
  payload: any,
  signal?: AbortSignal
): Promise<ApiResponse<T>> {

  try {
    const formData = new FormData();
    
    // Append each field from payload as form data
    Object.keys(payload).forEach((key) => {
      const value = payload[key];
      if (value !== undefined && value !== null) {
        // Handle arrays and objects by stringifying them
        if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    // Get authentication token
    const token = authService.getToken();
    const headers: HeadersInit = {};
    
    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log("API_BASE", API_BASE);
    const response = await fetch(`${API_BASE}/${endpoint}`, {
      method: "POST",
      headers,
      body: formData,
      signal,
    });

    // Handle 401 Unauthorized - try to refresh token and retry once
    if (response.status === 401 && token) {
      try {
        await authService.refreshAccessToken();
        const newToken = authService.getToken();
        
        if (newToken) {
          // Retry the request with new token
          const retryHeaders: HeadersInit = {
            'Authorization': `Bearer ${newToken}`
          };
          
          const retryResponse = await fetch(`${API_BASE}/${endpoint}`, {
            method: "POST",
            headers: retryHeaders,
            body: formData,
            signal,
          });

          // Process retry response
          const retryContentType = retryResponse.headers.get("Content-Type") || "";
          if (!retryContentType.includes("application/json")) {
            const text = await retryResponse.text();
            console.error("Non-JSON response received on retry:", text.slice(0, 200));
            return { 
              error: text || "Unexpected server response",
              retriable: true,
              rawResponse: text,
            };
          }

          if (retryResponse.ok) {
            const retryData: T = await retryResponse.json();
            
            if (Array.isArray(retryData) && retryData[0]?.status === "304") {
              return { 
                error: "Authentication required", 
                retriable: true 
              };
            }
            
            return { data: retryData };
          }

          // Retry also failed, fall through to error handling
          const errorBody = await retryResponse.text();
          console.error("status", retryResponse.status, "body", errorBody.slice(0, 200));
          return { 
            error: errorBody || `HTTP error ${retryResponse.status}`, 
            retriable: true,
            rawResponse: errorBody 
          };
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        authService.clearTokens();
      }
    }

    // --- Content type check ---
    const contentType = response.headers.get("Content-Type") || "";
    if (!contentType.includes("application/json")) {
      const text = await response.text(); // capture full response
      console.error("Non-JSON response received:", text.slice(0, 200));
      console.trace(`Trace for non-JSON response (${endpoint})`);

      return { 
        error: text || "Unexpected server response", // pass text to toast
        retriable: true,
        rawResponse: text,
      };
    }

    // --- Non-200 statuses ---
    if (!response.ok) {
      const errorBody = await response.text();
      console.error("status", response.status, "body", errorBody.slice(0, 200));
      console.trace(`Trace for HTTP error (${endpoint})`);

      return { 
        error: errorBody || `HTTP error ${response.status}`, 
        retriable: true,
        rawResponse: errorBody 
      };
    }

    const data: T = await response.json();

    if (Array.isArray(data) && data[0]?.status === "304") {
      console.error("JSON response contained status 304");
      console.trace(`Trace for JSON 304 error (${endpoint})`);

      return { 
        error: "Authentication required", 
        retriable: true 
      };
    }

    return { data };
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.warn("Request was aborted");
      console.trace(`Trace for AbortError (${endpoint})`);
      return { error: "Request cancelled" };
    }

    console.error(`Error in postToWorkflow (${endpoint}):`, error);
    console.trace(`Trace for unexpected error (${endpoint})`);

    return { 
      error: error.message || "Failed to fetch data", 
      retriable: true 
    };
  }
}
