import type { APIRoute } from 'astro';
import * as jose from 'jose';

const clientId = import.meta.env.GITHUB_CLIENT_ID;
const scope = "user";
const redirectUri = import.meta.env.GITHUB_REDIRECT_URI;
const stateSecret = import.meta.env.SIGN_STATE_SECRET

async function createSignedState() {
  const state = {
    random: crypto.getRandomValues(new Uint8Array(16)).join(''),
    timestamp: Date.now()
  };

  const secret = new TextEncoder().encode(stateSecret);
  return await new jose.SignJWT(state)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('5m') // State is valid for 5 minutes
    .sign(secret);
}

export const GET: APIRoute = async () => {
  const state = await createSignedState();

  return new Response(null, {
    status: 302,
    headers: {
      Location: `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`,
    },
  });
}
