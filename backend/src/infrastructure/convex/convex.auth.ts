import {
  createRemoteJWKSet,
  jwtVerify,
  JWTPayload,
} from 'jose';
import { logger } from '../../shared/logger';

export interface ConvexTokenPayload extends JWTPayload {
  sub: string;        // Convex user ID
  email?: string;
  name?: string;
}

let _jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwks() {
  if (!_jwks) {
    const issuer = process.env.CONVEX_JWT_ISSUER;
    if (!issuer) throw new Error('CONVEX_JWT_ISSUER is not set');

    const jwksUri = `${issuer}/.well-known/jwks.json`;
    _jwks = createRemoteJWKSet(new URL(jwksUri));
  }
  return _jwks;
}
  
export async function verifyConvexToken(token: string): Promise<ConvexTokenPayload> {
  const issuer = process.env.CONVEX_JWT_ISSUER;
  if (!issuer) throw new Error('CONVEX_JWT_ISSUER is not set');

  // if a local secret is configured we use it only _after_ attempting
  // verification with the remote JWKS.  This preserves compatibility when
  // both real Convex tokens (RS256) and locally‑signed tokens (HS256) are in
  // circulation; the former will verify correctly even though a secret is
  // present.
  const localSecret = process.env.CONVEX_JWT_SECRET;
  const verifyOptions = { issuer };

  // helper to run jwtVerify and normalize the payload
  const runVerify = async (key: unknown) => {
    const { payload } = await jwtVerify(token, key, verifyOptions);
    if (!payload.sub) {
      throw new Error('Token missing subject claim');
    }
    return payload as ConvexTokenPayload;
  };

  try {
    // first try remote JWKS
    return await runVerify(getJwks());
  } catch (error) {
    // if remote verification fails and we have a local secret, try HS
    if (localSecret) {
      try {
        return await runVerify(new TextEncoder().encode(localSecret));
      } catch (inner) {
        logger.warn('Local Convex token verification also failed', {
          error: inner instanceof Error ? inner.message : inner,
        });
      }
    }

    logger.warn('Convex token verification failed', {
      error: error instanceof Error ? error.message : error,
    });
    throw new Error('Invalid or expired token');
  }
}
