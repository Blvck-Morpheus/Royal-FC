import { QueryClient, QueryFunction } from "@tanstack/react-query";

// In production, use the current domain, otherwise use localhost
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? '' // Empty string means use the current domain
  : 'http://localhost:5001';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage;
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || res.statusText;
    } catch {
      errorMessage = await res.text() || res.statusText;
    }
    throw new Error(`${res.status}: ${errorMessage}`);
  }
}

export async function apiRequest<T = any>(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<{ response: Response; data: T }> {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

  try {
    const response = await fetch(fullUrl, {
      method,
      headers: {
        ...(data ? { "Content-Type": "application/json" } : {}),
        "Accept": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
      mode: "cors",
    });

    // Clone the response before checking if it's ok
    const responseClone = response.clone();

    // Check if response is ok
    if (!response.ok) {
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || response.statusText;
      } catch {
        errorMessage = await response.text() || response.statusText;
      }
      throw new Error(`${response.status}: ${errorMessage}`);
    }

    // Parse the JSON from the cloned response
    let responseData: T;
    try {
      responseData = await responseClone.json();
    } catch (e) {
      console.error("Error parsing response:", e);
      throw new Error("Failed to parse response data");
    }

    // Return both the response object and the parsed data
    return { response, data: responseData };
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      const baseUrl = API_BASE_URL || window.location.origin;
      throw new Error(`Unable to connect to server at ${baseUrl}. Please try again later.`);
    }
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

    try {
      const res = await fetch(fullUrl, {
        headers: {
          "Accept": "application/json",
        },
        credentials: "include",
        mode: "cors",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        const baseUrl = API_BASE_URL || window.location.origin;
        throw new Error(`Unable to connect to server at ${baseUrl}. Please try again later.`);
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: 1,
      retryDelay: 1000,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});
