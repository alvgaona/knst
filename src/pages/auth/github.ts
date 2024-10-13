import type { APIRoute } from 'astro';
import * as jose from 'jose';

const CLIENT_ID = import.meta.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.GITHUB_CLIENT_SECRET;
const REDIRECT_URI = import.meta.env.GITHUB_REDIRECT_URI;
const STATE_SECRET = import.meta.env.SIGN_STATE_SECRET;
const ALLOWED_USER = import.meta.env.ALLOWED_USER;

async function verifySignedState(signedState: string) {
  const secret = new TextEncoder().encode(STATE_SECRET);

  try {
    const { payload } = await jose.jwtVerify(signedState, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

export const GET: APIRoute = async ({ url, redirect }) => {
  const params = url.searchParams;

  const state = params.get("state");
  const code = params.get("code");

  if (!state) {
    return new Response('Missing state parameter', { status: 400 });
  }

  const verifiedState = await verifySignedState(state);

  if (!verifiedState) {
    return new Response('Invalid or expired state. Possible CSRF attack', { status: 400 });
  }

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri: REDIRECT_URI,
    })
  });

  const tokenData = await tokenResponse.json();

  const userResponse = await fetch('https://api.github.com/user', {
    headers: {
      'Authorization': `token ${tokenData.access_token}`,
      'Accept': 'application/json'
    }
  });

  const userData = await userResponse.json();

  if (userData.login !== ALLOWED_USER) {
    return new Response('Access denied.', { status: 403 });
  }

  const response = redirect('/');
  response.headers.set('Set-Cookie', `token=${tokenData.access_token}; HttpOnly; Secure; SameSite=Strict; Path=/`);
  return response;
};
