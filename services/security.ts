
// Simulating a server-side secret key. In production, this never leaves the server.
const MOCK_SECRET_KEY = "SHOPPERKS_SUPER_SECRET_KEY_2024";

export interface TokenPayload {
  rid: string; // Redemption ID (unique)
  cid: string; // Coupon ID
  uid: string; // User ID
  exp: number; // Expiry Timestamp
}

export interface SignedToken {
  payload: TokenPayload;
  signature: string;
}

// Helper to convert buffer to hex string
const bufferToHex = (buffer: ArrayBuffer): string => {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Generate SHA-256 Signature
const signData = async (data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(MOCK_SECRET_KEY);
  const messageData = encoder.encode(data);

  const cryptoKey = await window.crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await window.crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    messageData
  );

  return bufferToHex(signature);
};

export const SecurityService = {
  // Generate a secure, time-bound token
  async generateToken(couponId: string, userId: string): Promise<string> {
    const now = Date.now();
    const expiry = now + 1000 * 60 * 5; // 5 Minutes validity
    const redemptionId = `r_${now}_${Math.random().toString(36).substr(2, 9)}`;

    const payload: TokenPayload = {
      rid: redemptionId,
      cid: couponId,
      uid: userId,
      exp: expiry
    };

    const dataToSign = JSON.stringify(payload);
    const signature = await signData(dataToSign);

    const fullToken: SignedToken = {
      payload,
      signature
    };

    // Return Base64 encoded string to keep QR code compact
    return btoa(JSON.stringify(fullToken));
  },

  // Verify token validity and integrity
  async verifyToken(tokenString: string): Promise<{ valid: boolean; reason?: string; data?: TokenPayload }> {
    try {
      const jsonString = atob(tokenString);
      const token: SignedToken = JSON.parse(jsonString);
      const { payload, signature } = token;

      // 1. Check Expiry
      if (Date.now() > payload.exp) {
        return { valid: false, reason: 'EXPIRED' };
      }

      // 2. Verify Signature (Integrity Check)
      const dataToVerify = JSON.stringify(payload);
      const expectedSignature = await signData(dataToVerify);

      if (signature !== expectedSignature) {
        return { valid: false, reason: 'INVALID_SIGNATURE' };
      }

      return { valid: true, data: payload };

    } catch (e) {
      return { valid: false, reason: 'MALFORMED_TOKEN' };
    }
  }
};
