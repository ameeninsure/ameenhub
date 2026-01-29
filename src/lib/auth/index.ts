/**
 * Authentication Library
 * Professional JWT-based authentication system
 */

import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import { cookies } from 'next/headers';

// Environment variables (should be in .env)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production-min-32-chars!';
const JWT_ISSUER = process.env.JWT_ISSUER || 'ameenhub';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'ameenhub-users';

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

// Cookie names
export const ACCESS_TOKEN_COOKIE = 'auth_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

export interface TokenPayload extends JWTPayload {
  userId: number;
  username: string;
  email: string;
  roles: string[];
  type: 'access' | 'refresh';
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  roles: string[];
}

/**
 * Get the secret key as Uint8Array
 */
function getSecretKey(): Uint8Array {
  return new TextEncoder().encode(JWT_SECRET);
}

/**
 * Generate an access token
 */
export async function generateAccessToken(user: AuthUser): Promise<string> {
  const payload: Omit<TokenPayload, keyof JWTPayload> = {
    userId: user.id,
    username: user.username,
    email: user.email,
    roles: user.roles,
    type: 'access',
  };

  const token = await new SignJWT(payload as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .setSubject(user.id.toString())
    .sign(getSecretKey());

  return token;
}

/**
 * Generate a refresh token
 */
export async function generateRefreshToken(user: AuthUser): Promise<string> {
  const payload: Omit<TokenPayload, keyof JWTPayload> = {
    userId: user.id,
    username: user.username,
    email: user.email,
    roles: user.roles,
    type: 'refresh',
  };

  const token = await new SignJWT(payload as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .setSubject(user.id.toString())
    .sign(getSecretKey());

  return token;
}

/**
 * Generate both access and refresh tokens
 */
export async function generateTokens(user: AuthUser): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const [accessToken, refreshToken] = await Promise.all([
    generateAccessToken(user),
    generateRefreshToken(user),
  ]);

  return { accessToken, refreshToken };
}

/**
 * Verify and decode a token
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    return payload as TokenPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Set auth cookies (server-side)
 */
export async function setAuthCookies(accessToken: string, refreshToken: string): Promise<void> {
  const cookieStore = await cookies();
  
  // Access token - shorter lived, httpOnly
  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60, // 15 minutes
    path: '/',
  });

  // Refresh token - longer lived, httpOnly
  cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
}

/**
 * Clear auth cookies (server-side)
 */
export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  
  // Set cookies with expired date to ensure they are removed
  cookieStore.set(ACCESS_TOKEN_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    expires: new Date(0),
    path: '/',
  });
  
  cookieStore.set(REFRESH_TOKEN_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    expires: new Date(0),
    path: '/',
  });
}

/**
 * Get current user from cookies (server-side)
 */
export async function getCurrentUser(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!token) {
    return null;
  }

  return verifyToken(token);
}

/**
 * Get refresh token from cookies
 */
export async function getRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value || null;
}

/**
 * Check if user is authenticated (server-side)
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcryptjs');
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(password, hash);
}
