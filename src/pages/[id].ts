import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params }) => {
  const { id } = params;

  // TODO: read the original url from the database

  return new Response(null, {
    status: 302,
    headers: {
      Location: 'https://alvgaona.com',
    },
  });
};
