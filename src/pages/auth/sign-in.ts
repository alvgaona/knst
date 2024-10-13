import type { APIRoute } from 'astro';
import * as jose from 'jose';

const CLIENT_ID = import.meta.env.GITHUB_CLIENT_ID;
const SCOPE = "user";
const REDIRECT_URI = import.meta.env.GITHUB_REDIRECT_URI;
const STATE_SECRET = import.meta.env.SIGN_STATE_SECRET

async function createSignedState() {
  const state = {
    random: crypto.getRandomValues(new Uint8Array(16)).join(''),
    timestamp: Date.now()
  };

  const secret = new TextEncoder().encode(STATE_SECRET);
  return await new jose.SignJWT(state)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1m') // state is valid for 1 minute
    .sign(secret);
}

export const GET: APIRoute = async () => {
  const state = await createSignedState();

  return new Response(null, {
    status: 302,
    headers: {
      Location: `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}&state=${state}`,
    },
  });
}
