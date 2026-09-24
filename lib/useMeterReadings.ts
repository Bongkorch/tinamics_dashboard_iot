"use client";

import { useEffect, useMemo, useState } from "react";
import { collectionGroup, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { STALE_AFTER_MS } from "@/lib/roomStatus";

/* -------------------------------------------------------------------------- */
/*  Raw payload (as sent by the sensor / API)                                 */
/* -------------------------------------------------------------------------- */

export type RawMeterPayload = {
  plant: string;
  room: string;
  ts: string;
  sensorId: string;
  temp?: number;
  humi?: number;
  v_an: number;
  v_bn: number;
  v_cn: number;
  v_ab: number;
  v_bc: number;
  v_ca: number;
  v_ln_avg: number;
  v_ll_avg: number;

  i_a: number;
  i_b: number;
  i_c: number;
  i_n: number;
  i_avg: number;

  p_a: number;
  p_b: number;
  p_c: number;
  p_total: number;

  q_a: number;
  q_b: number;
  q_c: number;
  q_total: number;

  s_a: number;
  s_b: number;
  s_c: number;
  s_total: number;

  pf_a: number;
  pf_b: number;
  pf_c: number;
  pf_total: number;

  freq: number;
  unbalance_v: number;
  unbalance_i: number;

  level: string; // "normal" | "warning" | "alarm"
  risk: number; // 0–100
  flags: string; // comma-separated, e.g. "unbalance,neutral,pf"

  // Optional fields – fall back to temp / humi, then to 0 if missing
  cabinet_temp?: number;
  humidity?: number;
};

/* -------------------------------------------------------------------------- */
/*  UI types (used by <PhaseCard /> and the summary sections)                 */
/* -------------------------------------------------------------------------- */

export type PhaseId = "R" | "Y" | "B";
export type MeterStatus = "normal" | "warning" | "alarm";
export type PhaseIssue = "voltage" | "pf";

export type PhaseReading = {
  id: PhaseId;
  voltageLN: number;
  current: number;
  activePower: number;
  reactivePower: number;
  apparentPower: number;
  pf: number;
  inRange: boolean;
  issues: PhaseIssue[];
};

export type MeterReading = {
  meterId: string;
  sensorId: string;
  meterType: string;
  siteName: string;
  status: MeterStatus;
  risk: number;
  flags: string[];
  timestamp: Date;
  updatedMinutesAgo: number;
  phases: PhaseReading[];
  voltageLL: { RY: number; YB: number; BR: number };
  averages: { voltageLN: number; voltageLL: number; current: number };
  totals: {
    activePower: number;
    reactivePower: number;
    apparentPower: number;
    pf: number;
  };
  cabinetTemp: number;
  humidity: number;
  neutralCurrent: number;
  frequency: number;
  voltageUnbalance: number;
  currentUnbalance: number;
};

/* -------------------------------------------------------------------------- */
/*  Thresholds                                                                */
/* -------------------------------------------------------------------------- */

export type MeterThresholds = {
  voltageLN: { min: number; max: number };
  pfMin: number;
  frequency: { min: number; max: number };
  voltageUnbalanceMax: number;
  currentUnbalanceMax: number;
};

export const DEFAULT_THRESHOLDS: MeterThresholds = {
  voltageLN: { min: 207, max: 253 }, // 230 V ±10%
  pfMin: 0.8,
  frequency: { min: 49.5, max: 50.5 },
  voltageUnbalanceMax: 2,
  currentUnbalanceMax: 20,
};

/* -------------------------------------------------------------------------- */
/*  Mapping (pure functions – safe to use on the server or in tests)          */
/* -------------------------------------------------------------------------- */

type NumericKey = {
  [K in keyof RawMeterPayload]-?: RawMeterPayload[K] extends number ? K : never;
}[keyof RawMeterPayload];

type PhaseKeyMap = {
  id: PhaseId;
  v: NumericKey;
  i: NumericKey;
  p: NumericKey;
  q: NumericKey;
  s: NumericKey;
  pf: NumericKey;
};

// Sensor phases a / b / c map to R / Y / B
const PHASE_KEYS: readonly PhaseKeyMap[] = [
  { id: "R", v: "v_an", i: "i_a", p: "p_a", q: "q_a", s: "s_a", pf: "pf_a" },
  { id: "Y", v: "v_bn", i: "i_b", p: "p_b", q: "q_b", s: "s_b", pf: "pf_b" },
  { id: "B", v: "v_cn", i: "i_c", p: "p_c", q: "q_c", s: "s_c", pf: "pf_c" },
];

export function normalizeLevel(level: string): MeterStatus {
  const value = level.trim().toLowerCase();
  if (value === "alarm" || value === "critical" || value === "danger") return "alarm";
  if (value === "warning" || value === "warn") return "warning";
  return "normal";
}

export function parseFlags(flags: string | null | undefined): string[] {
  if (!flags) return [];
  return flags
    .split(",")
    .map((flag) => flag.trim().toLowerCase())
    .filter(Boolean);
}

export function minutesSince(ts: string | Date, now: number = Date.now()): number {
  const time = ts instanceof Date ? ts.getTime() : Date.parse(ts);
  if (Number.isNaN(time)) return 0;
  return Math.max(0, Math.floor((now - time) / 60_000));
}

function toPhase(
  raw: RawMeterPayload,
  keys: PhaseKeyMap,
  thresholds: MeterThresholds,
): PhaseReading {
  const voltageLN = raw[keys.v];
  const pf = raw[keys.pf];
  const issues: PhaseIssue[] = [];

  if (voltageLN < thresholds.voltageLN.min || voltageLN > thresholds.voltageLN.max) {
    issues.push("voltage");
  }
  if (Math.abs(pf) < thresholds.pfMin) {
    issues.push("pf");
  }

  return {
    id: keys.id,
    voltageLN,
    current: raw[keys.i],
    activePower: raw[keys.p],
    reactivePower: raw[keys.q],
    apparentPower: raw[keys.s],
    pf,
    inRange: issues.length === 0,
    issues,
  };
}

export type MapMeterOptions = {
  meterType?: string;
  siteName?: string;
  thresholds?: Partial<MeterThresholds>;
  now?: number;
};

export function mapMeterPayload(
  raw: RawMeterPayload,
  options: MapMeterOptions = {},
): MeterReading {
  const thresholds: MeterThresholds = { ...DEFAULT_THRESHOLDS, ...options.thresholds };
  const timestamp = new Date(raw.ts);

  return {
    meterId: raw.room,
    sensorId: raw.sensorId,
    meterType: options.meterType ?? "Distribution meter",
    siteName: options.siteName ?? raw.plant,
    status: normalizeLevel(raw.level),
    risk: raw.risk,
    flags: parseFlags(raw.flags),
    timestamp,
    updatedMinutesAgo: minutesSince(timestamp, options.now),
    phases: PHASE_KEYS.map((keys) => toPhase(raw, keys, thresholds)),
    voltageLL: { RY: raw.v_ab, YB: raw.v_bc, BR: raw.v_ca },
    averages: {
      voltageLN: raw.v_ln_avg,
      voltageLL: raw.v_ll_avg,
      current: raw.i_avg,
    },
    totals: {
      activePower: raw.p_total,
      reactivePower: raw.q_total,
      apparentPower: raw.s_total,
      pf: raw.pf_total,
    },
    cabinetTemp: raw.cabinet_temp ?? raw.temp ?? 0,
    humidity: raw.humidity ?? raw.humi ?? 0,
    neutralCurrent: raw.i_n,
    frequency: raw.freq,
    voltageUnbalance: raw.unbalance_v,
    currentUnbalance: raw.unbalance_i,
  };
}

/* -------------------------------------------------------------------------- */
/*  Firestore -> RawMeterPayload (same source as useRoomReadings)             */
/* -------------------------------------------------------------------------- */

// Accepts ISO string, epoch ms number, or Firestore Timestamp.
// Missing/invalid -> '' so the meter shows as offline (never faked as "now").
function toIso(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return new Date(value).toISOString();
  if (value instanceof Timestamp) return value.toDate().toISOString();
  return "";
}

// Missing or non-numeric fields become 0 instead of NaN.
function num(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function optNum(...values: unknown[]): number | undefined {
  const found = values.find((v) => v != null && Number.isFinite(Number(v)));
  return found === undefined ? undefined : Number(found);
}

export function toRawMeterPayload(
  data: Record<string, unknown>,
  ids: { plant: string; room: string },
): RawMeterPayload {
  return {
    plant: (data.plant as string) ?? ids.plant,
    room: (data.room as string) ?? ids.room,
    ts: toIso(data.ts ?? data.updatedAt),
    sensorId: (data.sensorId as string) ?? "",
    temp: optNum(data.temp, data.temperature),
    humi: optNum(data.humi, data.humidity),
    v_an: num(data.v_an), v_bn: num(data.v_bn), v_cn: num(data.v_cn),
    v_ab: num(data.v_ab), v_bc: num(data.v_bc), v_ca: num(data.v_ca),
    v_ln_avg: num(data.v_ln_avg), v_ll_avg: num(data.v_ll_avg),
    i_a: num(data.i_a), i_b: num(data.i_b), i_c: num(data.i_c), i_n: num(data.i_n), i_avg: num(data.i_avg),
    p_a: num(data.p_a), p_b: num(data.p_b), p_c: num(data.p_c), p_total: num(data.p_total),
    q_a: num(data.q_a), q_b: num(data.q_b), q_c: num(data.q_c), q_total: num(data.q_total),
    s_a: num(data.s_a), s_b: num(data.s_b), s_c: num(data.s_c), s_total: num(data.s_total),
    pf_a: num(data.pf_a), pf_b: num(data.pf_b), pf_c: num(data.pf_c), pf_total: num(data.pf_total),
    freq: num(data.freq),
    unbalance_v: num(data.unbalance_v),
    unbalance_i: num(data.unbalance_i),
    level: typeof data.level === "string" ? data.level : "normal",
    risk: num(data.risk),
    flags: typeof data.flags === "string" ? data.flags : "",
    cabinet_temp: optNum(data.cabinet_temp),
    humidity: optNum(data.humidity),
  };
}

/* -------------------------------------------------------------------------- */
/*  Hook                                                                      */
/* -------------------------------------------------------------------------- */

export type UseMeterReadingsOptions = MapMeterOptions & {
  /** Reading is considered stale after this many minutes. Default: same as rooms (10). */
  staleAfterMinutes?: number;
  enabled?: boolean;
};

export type UseMeterReadingsResult = {
  data: MeterReading | null;
  raw: RawMeterPayload | null;
  error: string | null;
  isLoading: boolean;
  isStale: boolean;
};

export function useMeterReadings(
  room: string,
  {
    staleAfterMinutes = STALE_AFTER_MS / 60_000,
    enabled = true,
    meterType,
    siteName,
    thresholds,
  }: UseMeterReadingsOptions = {},
): UseMeterReadingsResult {
  const [raw, setRaw] = useState<RawMeterPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(enabled);
  const [now, setNow] = useState(() => Date.now());

  // Live listener on every "rooms" subcollection; pick the doc for this meter.
  useEffect(() => {
    if (!enabled) return;
    const unsubscribe = onSnapshot(
      collectionGroup(db, "rooms"),
      (snap) => {
        const match = snap.docs.find(
          (d) => d.id === room || (d.data() as Record<string, unknown>).room === room,
        );
        setRaw(
          match
            ? toRawMeterPayload(match.data() as Record<string, unknown>, {
                plant: match.ref.parent.parent?.id ?? "unknown",
                room: match.id,
              })
            : null,
        );
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore error meter:", err.message);
        setError(err.message);
        setIsLoading(false);
      },
    );
    return unsubscribe;
  }, [room, enabled]);

  // Keep "Updated X min ago" and staleness moving even when no new data arrives.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const data = useMemo(
    () => (raw ? mapMeterPayload(raw, { meterType, siteName, thresholds, now }) : null),
    // thresholds is compared by reference; memoize it in the caller if it's built inline
    [raw, meterType, siteName, thresholds, now],
  );

  // A missing / invalid timestamp counts as stale, never as "just now".
  const isStale = raw
    ? Number.isNaN(Date.parse(raw.ts)) || minutesSince(raw.ts, now) >= staleAfterMinutes
    : false;

  return { data, raw, error, isLoading, isStale };
}
