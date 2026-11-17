// The server keeps NO in-memory copy of platform data. Postgres is the single
// source of truth; every route reads and writes it directly and fails loudly
// when it is unavailable. Only workflow constants live here.
export const STAGE_ORDER = Object.freeze({
  INTAKE_RECEIVED: 1,
  NURSE_CHECK: 2,
  DOCTOR_REVIEW: 3,
  AWAITING_PAYMENT: 4,
  WITH_CONSULTANT: 5,
  OPINION_READY: 6,
  PARTNER_SERVICES: 7,
  FOLLOW_UP_21_DAYS: 8,
  CLOSED: 9,
});