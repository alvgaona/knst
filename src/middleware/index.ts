import { defineMiddleware } from 'astro:middleware';
import { minimatch } from 'minimatch';

const ALLOWED_USER = import.meta.env.ALLOWED_USER;

const EXCLUDED_PATTERNS = ["/auth/**", "/public/**", "/*"];

async function getGithubUser(token: string) {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
  if (!response.ok) return null;
  return await response.json();
}

export const onRequest = defineMiddleware(async ({ request }, next) => {
  const url = new URL(request.url);
  if (EXCLUDED_PATTERNS.some(pattern => minimatch(url.pathname, pattern))) {
    return next();
  }

  const cookies = request.headers.get('Cookie');
  const token = cookies?.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];
  if (token) {
    const user = await getGithubUser(token);
    if (user && user.login === ALLOWED_USER) {
      return next();
    }
    return new Response('Unauthorized', { status: 403 });
  }
  return new Response('Authentication required', { status: 401 });
});
