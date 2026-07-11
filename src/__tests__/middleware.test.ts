import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';

function makeToken(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  // Signature is never verified in middleware (Edge Runtime limitation), a placeholder is fine.
  return `${header}.${body}.placeholder-signature`;
}

function makeRequest(path: string, token?: string): NextRequest {
  const req = new NextRequest(new URL(path, 'http://localhost:3000'));
  if (token) {
    req.cookies.set('access_token', token);
  }
  return req;
}

describe('middleware', () => {
  // AC-01
  it('redirects to /login when access_token cookie is missing', () => {
    const res = middleware(makeRequest('/dashboard'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/login');
  });

  // AC-02
  it('passes through /admin/* when the JWT roles include admin', () => {
    const token = makeToken({ sub: 1, email: 'a@b.com', roles: ['admin'] });
    const res = middleware(makeRequest('/admin/users', token));
    expect(res.headers.get('location')).toBeNull();
  });

  // AC-03
  it('redirects to /403 when the JWT roles do not include admin for /admin/*', () => {
    const token = makeToken({ sub: 2, email: 'e@b.com', roles: ['employee'] });
    const res = middleware(makeRequest('/admin/users', token));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/403');
  });

  // AC-04
  it('passes through non-/admin paths for any authenticated role', () => {
    const token = makeToken({ sub: 2, email: 'e@b.com', roles: ['employee'] });
    const res = middleware(makeRequest('/dashboard', token));
    expect(res.headers.get('location')).toBeNull();
  });

  // AC-05
  it('treats a malformed/undecodable JWT the same as a missing token: redirect to /login', () => {
    const res = middleware(makeRequest('/dashboard', 'not-a-valid-jwt'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/login');
  });

  // AC-06
  it('lets /403 itself through without requiring authentication', () => {
    const res = middleware(makeRequest('/403'));
    expect(res.headers.get('location')).toBeNull();
  });
});
