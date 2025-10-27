import FingerprintJS from '@fingerprintjs/fingerprintjs';

let cachedFingerprint: string | null = null;

/**
 * Get a unique device fingerprint for reconnection purposes
 * The fingerprint is cached for the session
 */
export async function getDeviceFingerprint(): Promise<string> {
  if (cachedFingerprint) {
    return cachedFingerprint;
  }

  try {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    cachedFingerprint = result.visitorId;
    return cachedFingerprint;
  } catch (error) {
    console.error('Failed to generate device fingerprint:', error);
    // Fallback to a random UUID stored in localStorage
    const fallbackId = localStorage.getItem('deviceFallbackId');
    if (fallbackId) {
      cachedFingerprint = fallbackId;
      return fallbackId;
    }

    const newFallbackId = `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('deviceFallbackId', newFallbackId);
    cachedFingerprint = newFallbackId;
    return newFallbackId;
  }
}
