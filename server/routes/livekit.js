import express from 'express';
import { AccessToken } from 'livekit-server-sdk';

const router = express.Router();

const LIVEKIT_URL = process.env.LIVEKIT_URL || 'wss://alo-6mx1e8u4.livekit.cloud';
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || 'APIiLjE4bWZqDAE';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || 'Oj7blmfqaXWndhxlg25RYBs9jjtGV2mPxLvRzV6gS0W';

/**
 * POST /token
 * Safely mints an AccessToken on the backend without leaking apiSecret to the client.
 */
router.post('/token', async (req, res) => {
  try {
    const {
      roomName = 'ALO-2026-LIVE',
      participantName = 'Participant',
      participantRole = 'patient',
      identity: customIdentity,
    } = req.body;

    const sanitizedRole = (participantRole || 'patient').toLowerCase().replace(/\s+/g, '_');
    const sanitizedName = (participantName || 'Guest').trim();
    const identity = customIdentity || `${sanitizedRole}_${sanitizedName.replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '_')}_${Date.now().toString().slice(-4)}`;

    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity,
      name: sanitizedName,
      ttl: '2h',
      metadata: JSON.stringify({
        role: sanitizedRole,
        joinedAt: new Date().toISOString(),
      }),
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();

    return res.json({
      success: true,
      token,
      serverUrl: LIVEKIT_URL,
      roomName,
      identity,
      role: sanitizedRole,
    });
  } catch (error) {
    console.error('Error generating LiveKit token:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to mint LiveKit access token',
      details: error.message,
    });
  }
});

/**
 * GET /config
 * Safe public config endpoint (never exposes secret)
 */
router.get('/config', (req, res) => {
  res.json({
    success: true,
    serverUrl: LIVEKIT_URL,
    configured: Boolean(LIVEKIT_API_KEY && LIVEKIT_API_SECRET),
  });
});

export default router;
