/**
 * PushService — mock push notifications until expo-notifications lands.
 * Two call shapes are supported (VerdictScreen passes an object payload,
 * FamilyScreen passes (memberId, reason)).
 */
import { Alert } from 'react-native';

function alertGuardian(payloadOrId, reason) {
  const payload =
    payloadOrId && typeof payloadOrId === 'object'
      ? payloadOrId
      : { memberId: payloadOrId, reason: reason || 'manual_alert' };

  // Mock push confirmation — replace with expo-notifications when wired.
  Alert.alert(
    'Guardian Alert Bheja Gaya',
    `${payload.memberName || 'Family member'} ko ${payload.riskLevel || 'ALERT'} khabar mil gayi.`,
    [{ text: 'Theek hai' }]
  );

  return Promise.resolve({ sent: true, success: true, push_id: 'mock_' + Date.now() });
}

export const PushService = { alertGuardian };
export { alertGuardian };
