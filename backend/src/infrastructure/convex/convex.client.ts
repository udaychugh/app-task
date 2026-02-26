import axios from 'axios';
import { randomBytes } from 'crypto';
import { SignJWT } from 'jose';
import { logger } from '../../shared/logger';

interface IssueConvexTokensInput {
  email: string;
  name: string;
}

interface IssueConvexTokensOutput {
  token: string;
  refresh_token: string;
}

// Attempt to POST to a Convex-managed issuance endpoint.  If the network call
// returns 404 or another error and a local signing key is configured we fall
// back to generating a token ourselves.  This makes the backend functional
// even when the Convex deployment doesn't expose a server-side auth API.
export async function issueConvexTokens(
  data: IssueConvexTokensInput
): Promise<IssueConvexTokensOutput> {
  const base = process.env.CONVEX_URL;
  const attempts: Array<{ url: string; error: unknown; status?: number }> = [];

  if (base) {
    const hints = [
      '/auth/issue',
      '/api/auth/issue',
      '/v1/auth/issue',
      '/auth/token',
      '/api/auth/token',
      '/api/token',
      '/auth',
      '/api/auth',
    ];

    for (const path of hints) {
      const url = `${base}${path}`;
      try {
        const resp = await axios.post(url, data);
        attempts.push({ url, status: resp.status, error: null });
        return resp.data;
      } catch (err: any) {
        const status = err?.response?.status;
        attempts.push({ url, error: err.message || err, status });
        if (status && status !== 404) {
          break; // something else went wrong, don't try further
        }
      }
    }
  }

  // remote issuance failed or wasn't configured; fall back to local signing
  const secret = process.env.CONVEX_JWT_SECRET;
  if (secret) {
    logger.warn('Remote Convex token issuance failed, signing locally', {
      attempts,
    });

    const issuer = process.env.CONVEX_JWT_ISSUER;
    if (!issuer) {
      throw new Error('CONVEX_JWT_ISSUER is required for local token signing');
    }

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: issuer, // must match the issuer used during verification
      sub: data.email,
      email: data.email,
      name: data.name,
      iat: now,
      exp: now + 60 * 60, // 1h
    };

    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .sign(new TextEncoder().encode(secret));

    // refresh token can be random string for now
    const refresh_token = randomBytes(32).toString('hex');
    return { token, refresh_token };
  }

  // if we got here, nothing worked
  logger.error('All Convex token endpoints failed', { attempts });
  throw new Error('Unable to obtain Convex token');
}
