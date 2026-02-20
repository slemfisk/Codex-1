import { randomUUID } from 'node:crypto';

export type ApiEnvelope<T> = {
  requestId: string;
  ok: boolean;
  data?: T;
  error?: { message: string; code?: string };
};

export const ok = <T>(data: T, requestId = randomUUID()): ApiEnvelope<T> => ({ requestId, ok: true, data });
export const fail = (message: string, requestId = randomUUID(), code?: string): ApiEnvelope<never> => ({
  requestId,
  ok: false,
  error: { message, code }
});
