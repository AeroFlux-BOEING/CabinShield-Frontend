/**
 * HTTP / WebSocket client for the CabinShield Ground API (CabinShield-Backend).
 *
 * Configure with EXPO_PUBLIC_API_URL (e.g. http://localhost:8000) and, when the server has
 * CS_API_KEY set, EXPO_PUBLIC_API_KEY. Without an URL the app runs fully offline as before.
 */
import type {
  ApiBriefing, ApiErrorDetail, ApiFlight, ApiForecast, ApiScheduledFlight, ApiScheduleLookup, SyncEvent, SyncResult, WsMessage,
} from './types';

export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/+$/, '');
const API_KEY = process.env.EXPO_PUBLIC_API_KEY ?? '';

export const apiEnabled = API_URL.length > 0;

export class ApiError extends Error {
  constructor(public status: number, public detail: ApiErrorDetail | string | null) {
    super(typeof detail === 'string' ? detail : detail?.msg?.en ?? `HTTP ${status}`);
  }
}

async function request<T>(method: string, path: string, body?: unknown, timeoutMs = 8000): Promise<T | null> {
  if (!apiEnabled) throw new ApiError(0, 'API_URL not configured');
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(API_URL + path, {
      method,
      signal: ctl.signal,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : null),
        ...(API_KEY ? { 'X-API-Key': API_KEY } : null),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (res.status === 204 || res.status === 304) return null;
    const text = await res.text();
    const json = text ? JSON.parse(text) : null;
    if (!res.ok) throw new ApiError(res.status, json?.detail ?? null);
    return json as T;
  } finally {
    clearTimeout(timer);
  }
}

const enc = encodeURIComponent;

export const api = {
  health: () => request<{ ok: boolean; version: string; model: string }>('GET', '/healthz', undefined, 4000),
  schedule: () => request<ApiScheduledFlight[]>('GET', '/api/v1/schedule'),
  scheduleLookup: (flightNo: string, date: string) =>
    request<ApiScheduleLookup>('GET', `/api/v1/schedule/${enc(flightNo)}?date=${enc(date)}`, undefined, 5000),
  createFlight: (body: { flight_no: string; date: string; dep_local?: string }) =>
    request<ApiFlight>('POST', '/api/v1/flights', body),
  briefing: (flightId: string) => request<ApiBriefing>('GET', `/api/v1/flights/${enc(flightId)}/briefing`, undefined, 15000),
  /** null (204) when the tablet already holds `since` */
  forecast: (routeId: string, since?: number) =>
    request<ApiForecast>('GET', `/api/v1/forecast/${enc(routeId)}${since != null ? `?since=${since}` : ''}`),
  sync: (flightId: string, body: { device_id: string; forecast_version: number | null; events: SyncEvent[] }) =>
    request<SyncResult>('POST', `/api/v1/flights/${enc(flightId)}/sync`, body, 15000),
};

/** Live stream for one flight. Returns a close function; reconnects with back-off until closed. */
export function openFlightSocket(
  flightId: string,
  handlers: { onMessage: (m: WsMessage) => void; onStatus?: (open: boolean) => void },
): () => void {
  if (!apiEnabled || typeof WebSocket === 'undefined') return () => {};
  const base = API_URL.replace(/^http/, 'ws');
  const url = `${base}/ws/flights/${enc(flightId)}${API_KEY ? `?token=${enc(API_KEY)}` : ''}`;
  let ws: WebSocket | null = null;
  let closed = false;
  let retry = 1000;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const connect = () => {
    if (closed) return;
    ws = new WebSocket(url);
    ws.onopen = () => {
      retry = 1000;
      handlers.onStatus?.(true);
    };
    ws.onmessage = (e) => {
      try {
        handlers.onMessage(JSON.parse(String(e.data)) as WsMessage);
      } catch {
        /* ignore malformed frames */
      }
    };
    ws.onclose = (e) => {
      handlers.onStatus?.(false);
      // 4401 bad token / 4404 unknown flight: retrying will not help
      if (closed || e.code === 4401 || e.code === 4404) return;
      timer = setTimeout(connect, retry);
      retry = Math.min(retry * 2, 30000);
    };
    ws.onerror = () => ws?.close();
  };
  connect();
  return () => {
    closed = true;
    clearTimeout(timer);
    ws?.close();
  };
}
