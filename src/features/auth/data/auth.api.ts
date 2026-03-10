import { AuthSession, User } from "../domain/auth.types";

import { request } from "@/core/http/http-client";
import { HttpError } from "@/core/http/http-error";

type AuthUserDto = {
  id: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type AuthResponse = {
  access_token?: string;
  token?: string;
  user: AuthUserDto;
};

export type SignupInput = {
  email: string;
  password: string;
  username: string;
  firstName?: string;
  lastName?: string;
};

const CURRENT_USER_ENDPOINTS = ["/auth/me", "/users/me"] as const;
const FORGOT_PASSWORD_ENDPOINTS = [
  "/auth/forgot-password",
  "/auth/password/forgot",
] as const;

function mapUser(dto: AuthUserDto): User {
  return {
    id: dto.id,
    email: dto.email,
    username: dto.username,
    firstName: dto.first_name,
    lastName: dto.last_name,
    role: dto.role,
    isActive: dto.is_active,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

function mapAuthSession(response: AuthResponse): AuthSession {
  const accessToken = response.access_token ?? response.token;

  if (!accessToken) {
    throw new Error("Réponse d’authentification invalide: token manquant.");
  }

  return {
    accessToken,
    user: mapUser(response.user),
  };
}

export async function login(
  email: string,
  password: string,
): Promise<AuthSession> {
  const data = await request<AuthResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });

  return mapAuthSession(data);
}

export async function signup(input: SignupInput): Promise<AuthSession> {
  const body = {
    email: input.email,
    password: input.password,
    username: input.username,
    first_name: input.firstName,
    last_name: input.lastName,
  };

  try {
    const data = await request<AuthResponse>("/auth/register", {
      method: "POST",
      body,
      auth: false,
    });

    return mapAuthSession(data);
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      const data = await request<AuthResponse>("/auth/signup", {
        method: "POST",
        body,
        auth: false,
      });

      return mapAuthSession(data);
    }

    throw error;
  }
}

export async function requestPasswordReset(email: string): Promise<void> {
  let lastNotFoundError: HttpError | null = null;

  for (const endpoint of FORGOT_PASSWORD_ENDPOINTS) {
    try {
      await request<unknown>(endpoint, {
        method: "POST",
        body: { email },
        auth: false,
      });
      return;
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) {
        lastNotFoundError = error;
        continue;
      }

      throw error;
    }
  }

  if (lastNotFoundError) {
    return;
  }

  throw new Error("Unable to request password reset.");
}

export async function getCurrentUser(): Promise<User> {
  let lastNotFoundError: HttpError | null = null;

  for (const endpoint of CURRENT_USER_ENDPOINTS) {
    try {
      const data = await request<AuthUserDto>(endpoint);
      return mapUser(data);
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) {
        lastNotFoundError = error;
        continue;
      }

      throw error;
    }
  }

  if (lastNotFoundError) {
    throw lastNotFoundError;
  }

  throw new Error("Unable to load current user profile.");
}
