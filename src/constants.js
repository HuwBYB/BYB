// src/constants.js
export const DEV_USER_ID = "11111111-1111-1111-1111-111111111111";
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const ensureUuid = (v) => (UUID_RE.test(v || "") ? v : DEV_USER_ID);
