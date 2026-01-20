/**
 * API Client utility for making type-safe API requests with better error handling
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: any;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Generic API request function with error handling
 */
export async function apiRequest<T = any>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || data.error || `Request failed with status ${response.status}`,
        response.status,
        data.details
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new ApiError("Network error. Please check your connection.", 0);
    }

    throw new ApiError(
      error instanceof Error ? error.message : "An unexpected error occurred",
      500
    );
  }
}

/**
 * Convenience methods for common HTTP methods
 */
export const api = {
  get: <T = any>(url: string, options?: RequestInit) =>
    apiRequest<T>(url, { ...options, method: "GET" }),

  post: <T = any>(url: string, body?: any, options?: RequestInit) =>
    apiRequest<T>(url, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(url: string, body?: any, options?: RequestInit) =>
    apiRequest<T>(url, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(url: string, options?: RequestInit) =>
    apiRequest<T>(url, { ...options, method: "DELETE" }),

  patch: <T = any>(url: string, body?: any, options?: RequestInit) =>
    apiRequest<T>(url, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),
};
