import { AuthSession, User } from "../domain/auth.types";

import { request } from "@/core/http/http-client";
import { HttpError } from "@/core/http/http-error";

type AuthUserDto = {
  id: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  role: string;
  is_active: boolean;
  deletion_requested_at?: string | null;
  deletion_scheduled_for?: string | null;
  created_at: string;
  updated_at: string;
};

type AuthResponse = {
  access_token?: string;
  token?: string;
  user: AuthUserDto;
};

/**
 * Signup payload — Issue #764 simplified to email + password only.
 * The backend auto-generates the username from the email local-part
 * if `username` is omitted (which is now the default).
 */
export type SignupInput = {
  email: string;
  password: string;
  username?: string;
  firstName?: string;
  lastName?: string;
};

export type UpdateProfileInput = {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export type AccountDeletionSchedule = {
  status: "scheduled";
  requestedAt: string;
  scheduledFor: string;
  gracePeriodDays: number;
};

type AccountDeletionScheduleDto = {
  status: "scheduled";
  requested_at: string;
  scheduled_for: string;
  grace_period_days: number;
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
    bio: dto.bio,
    role: dto.role,
    isActive: dto.is_active,
    deletionRequestedAt: dto.deletion_requested_at,
    deletionScheduledFor: dto.deletion_scheduled_for,
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
  // Only forward optional fields when explicitly provided — the
  // backend's CreateUserDto rejects empty strings on optional fields
  // and auto-generates a username when omitted.
  const body: Record<string, string> = {
    email: input.email,
    password: input.password,
  };
  if (input.username) body.username = input.username;
  if (input.firstName) body.first_name = input.firstName;
  if (input.lastName) body.last_name = input.lastName;

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
    throw new Error("Password reset endpoint unavailable.");
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

export async function updateCurrentUser(
  input: UpdateProfileInput,
): Promise<User> {
  const body: Record<string, string> = {};

  if (input.email !== undefined) body.email = input.email;
  if (input.username !== undefined) body.username = input.username;
  if (input.firstName !== undefined) body.first_name = input.firstName;
  if (input.lastName !== undefined) body.last_name = input.lastName;
  if (input.bio !== undefined) body.bio = input.bio;

  const data = await request<AuthUserDto>("/auth/me", {
    method: "PATCH",
    body,
  });

  return mapUser(data);
}

export async function changeCurrentUserPassword(
  input: ChangePasswordInput,
): Promise<void> {
  await request<{ message: string }>("/auth/me/change-password", {
    method: "POST",
    body: {
      old_password: input.currentPassword,
      new_password: input.newPassword,
    },
  });
}

export async function deleteCurrentUser(): Promise<void> {
  await request<{ message: string }>("/auth/me", {
    method: "DELETE",
  });
}

export async function requestCurrentUserDeletion(): Promise<AccountDeletionSchedule> {
  const data = await request<AccountDeletionScheduleDto>("/auth/me/deletion", {
    method: "POST",
  });

  return {
    status: data.status,
    requestedAt: data.requested_at,
    scheduledFor: data.scheduled_for,
    gracePeriodDays: data.grace_period_days,
  };
}

export async function cancelCurrentUserDeletion(): Promise<void> {
  await request<{ message: string }>("/auth/me/deletion", {
    method: "DELETE",
  });
}
