import { AccessToken } from 'livekit-server-sdk';

export const LIVEKIT_CONFIG = {
  url: 'wss://alo-6mx1e8u4.livekit.cloud',
  apiKey: 'APIiLjE4bWZqDAE',
  apiSecret: 'Oj7blmfqaXWndhxlg25RYBs9jjtGV2mPxLvRzV6gS0W',
};

export async function createLiveKitToken({
  roomName,
  participantName,
  participantRole,
}: {
  roomName: string;
  participantName: string;
  participantRole: string;
}): Promise<string> {
  const at = new AccessToken(LIVEKIT_CONFIG.apiKey, LIVEKIT_CONFIG.apiSecret, {
    identity: `${participantRole}-${participantName.replace(/\s+/g, '_')}`,
    name: participantName,
    ttl: '2h',
  });
  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });
  return await at.toJwt();
}
