/**
 * Subset of the CabinShield Ground API contract (CabinShield-Backend/app/models.py) the app uses.
 * Full schema: GET {API_URL}/openapi.json
 */
import type { Txt } from '../i18n/LangContext';

export interface ApiScheduledFlight {
  flight_no: string;
  origin: string;
  destination: string;
  destination_name: Txt;
  /** Korea time HH:MM */
  dep_local: string;
  block_min: number;
  aircraft: string;
  aircraft_note: Txt;
  /** 0 = Sunday */
  days: number[];
  supported: boolean;
  route_id: string;
}

export interface ApiScheduleLookup {
  flight: ApiScheduledFlight;
  date: string;
  operates: boolean;
  next_operating_date: string | null;
  dep_utc: string | null;
}

export interface ApiFlight {
  id: string;
  flight_no: string;
  date: string;
  route_id: string;
  aircraft: string;
  dep_local: string;
  dep_utc: string;
  status: 'SCHEDULED' | 'IN_FLIGHT' | 'ARRIVED';
  feed: 'SIMULATOR' | 'AIRCRAFT_FEED';
  created_at: string;
}

/** Forecast area as the server stores it (HazardIn + id). */
export interface ApiHazard {
  id: string;
  name: Txt;
  fl: [number, number];
  f: number;
  off_nm: number;
  r_nm: number;
  drift_kt: number;
  shape: number[];
  source?: string;
  centre_ll?: { lat: number; lon: number };
  t_obs_utc?: string;
  vertices_nm?: [number, number][];
  floor?: number;
  drift_dir_deg?: number;
  valid_from_utc?: string;
  valid_to_utc?: string;
}

export interface ApiForecast {
  route_id: string;
  version: number;
  issued_at: string;
  source: string;
  hazards: ApiHazard[];
}

export interface ApiHistory {
  id: string;
  d0_nm: number;
  d1_nm: number;
  name: Txt;
  cases: number;
  fl_band: [number, number];
  pattern: Txt;
  severity: Txt;
  season: Txt;
}

export interface ApiBriefing {
  flight: ApiFlight;
  reference_version: string;
  forecast: { version: number; issued_at: string; hazards: ApiHazard[] };
  history: ApiHistory[];
  model: { version: string; sha256?: string; url: string };
  generated_at: string;
}

export type SyncKind = 'log' | 'checklist' | 'decision' | 'cabin' | 'point' | 'link';

export interface SyncEvent {
  id: string;
  kind: SyncKind;
  t_s: number;
  at?: string;
  payload: Record<string, unknown>;
}

export interface SyncVerdict {
  event_id: string;
  agree: boolean;
  client_pick: string;
  server_pick: string;
  flags: string[];
}

export interface SyncResult {
  accepted: number;
  duplicates: number;
  verdicts: SyncVerdict[];
  forecast_version: number;
  forecast_stale: boolean;
  server_time: string;
}

export interface ApiErrorDetail {
  code?: string;
  msg?: Txt;
  next_operating_date?: string | null;
}

export type WsMessage =
  | { type: 'state'; data: Record<string, unknown> }
  | { type: 'event'; event: string; data: { t_s: number; utc: string; kind: string; msg?: Txt; data?: Record<string, unknown> } }
  | { type: 'ping' };
