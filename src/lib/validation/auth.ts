import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("올바른 이메일을 입력해 주세요."),
  password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다."),
});

export type LoginInput = z.infer<typeof loginSchema>;
