import { request } from "@/core/http/http-client";

import { AuthSession, User } from "../domain/auth.types";

type LoginResponse = {
  access_token: string;
  user: {
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
};

function mapUser(dto: LoginResponse["user"]): User {
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

export async function login(
  email: string,
  password: string,
): Promise<AuthSession> {
  const data = await request<LoginResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });

  return {
    accessToken: data.access_token,
    user: mapUser(data.user),
  };
}
