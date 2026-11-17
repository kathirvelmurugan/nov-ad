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

// Pilot default PIN. While this is non-empty, every account created through
// staff enrolment (users.js) or tenant onboarding (tenants.js) is born already
// activated and holding this PIN, so an administrator can hand over one working
// credential instead of a one-time code. An explicit `pin` in the request still
// wins over it.
//
// Set to '' to restore the original behaviour: a random 6-digit activation code
// that the owner exchanges exactly once for a PIN only they know. Nothing else
// reads this constant, so flipping it is the whole change.
//
// Every account sharing one PIN means anyone who knows a phone number can sign
// in as that person. That is acceptable for a short pilot and not for real
// patient data.
export const DEFAULT_STAFF_PIN = '1234';