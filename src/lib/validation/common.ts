import { z } from "zod";

export const uuid = z.string().uuid();

export const trimmedString = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `최대 ${max}자까지 입력할 수 있습니다.`);

export const requiredString = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .min(min, `${label} 은(는) 최소 ${min}자 이상이어야 합니다.`)
    .max(max, `${label} 은(는) 최대 ${max}자까지 입력할 수 있습니다.`);

/**
 * 낙관적 ID(폼 submit 시 새로 생성된 로컬 ID 등)는 uuid 가 아닐 수 있으므로 nullable 처리.
 */
export const optionalUuid = z.union([uuid, z.literal("").transform(() => undefined)]).optional();
