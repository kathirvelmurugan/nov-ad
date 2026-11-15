import { apiClient } from './apiClient';

export const LIVEKIT_CONFIG = {
  url: 'wss://alo-6mx1e8u4.livekit.cloud',
};

/**
 * Requests a secure LiveKit JWT from the backend API.
 * The master apiSecret remains strictly secured on the server.
 */
export async function createLiveKitToken({
  roomName,
  participantName,
  participantRole,
  identity,
}: {
  roomName: string;
  participantName: string;
  participantRole: string;
  identity?: string;
}): Promise<string> {
  const result = await apiClient.createLiveKitToken({
    roomName,
    participantName,
    participantRole,
    identity,
  });

  if (!result || !result.token) {
    throw new Error('Backend failed to issue a signed LiveKit access token');
  }

  return result.token;
}
