/**
 * FamilyService — family invite/pairing helpers (mock until deep links land).
 */

/** 6-digit invite code, e.g. "483920". */
function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** Accept an invite deep link token (safepakistan://invite/:token). */
async function acceptInvite(token) {
  return { success: true, token: token || null, accepted_at: new Date().toISOString() };
}

/** Decline an invite deep link token. */
async function declineInvite(token) {
  return { success: true, token: token || null, declined_at: new Date().toISOString() };
}

export const FamilyService = { generateCode, acceptInvite, declineInvite };
