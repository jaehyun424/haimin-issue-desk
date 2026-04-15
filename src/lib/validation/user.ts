import { z } from "zod";
import { ROLES } from "../constants/roles";
import { requiredString, uuid } from "./common";

export const userCreateSchema = z.object({
  email: z.string().trim().toLowerCase().email("올바른 이메일이어야 합니다."),
  name: requiredString(1, 60, "이름"),
  role: z.enum(ROLES),
  password: z.string().min(8, "비밀번호는 최소 8자."),
});

export const userRoleSchema = z.object({
  id: uuid,
  role: z.enum(ROLES),
});

export const userActiveSchema = z.object({
  id: uuid,
  isActive: z.boolean(),
});

export const userResetPasswordSchema = z.object({
  id: uuid,
  password: z.string().min(8, "비밀번호는 최소 8자."),
});
