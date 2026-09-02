/**
 * mockData — one-tap demo INPUTS only.
 *
 * These are sample messages a presenter pastes to exercise each verdict class.
 * They are NOT fabricated stats and are never rendered as history/analytics.
 * All Home / Report / Library numbers come from the real scan store
 * (see src/services/LocalDBService.js) — an empty store stays empty.
 */

// One-tap demo messages — one per verdict class, calibrated so the on-device
// rule engine reproduces each class deterministically (works with no network):
//   scam → 96, suspicious → 53, safe → 0.
export const PRESET_SMS = {
  scam: 'Mubarak ho! Apko 25,000 mile hain. OTP bhejein foran warna account band ho jayega.',
  safe: 'Your JazzCash statement for August shows a credit of Rs 5,000. No action required.',
  suspicious: 'Dear customer, apka account verify karna zaroori hai. Apna CNIC update karein warna service band ho jayegi.',
};
