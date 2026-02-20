export type ApiEnvelope<T> = {
  requestId: string;
  ok: boolean;
  data?: T;
  error?: { message: string; code?: string };
};

export const ok = <T>(data: T, requestId: string): ApiEnvelope<T> => ({ requestId, ok: true, data });
export const fail = (message: string, requestId: string, code?: string): ApiEnvelope<never> => ({
  requestId,
  ok: false,
  error: { message, code }
});
