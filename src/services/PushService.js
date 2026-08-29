/**
 * PushService — guardian alert delivery.
 * MOCK implementation for P0: will be replaced with FCM/APNs later.
 */

export async function alertGuardian(memberId, reason) {
  // Mock push (memberId/reason are recorded by the real FCM/APNs call later)
  return Promise.resolve({ success: true, sentAt: Date.now() });
}
