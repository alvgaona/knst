import type { APIRoute } from 'astro';

function generateId(): string {
  return Math.random().toString(36).substr(2, 6);
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    const { url } = body;

    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const id = generateId();

    return new Response(
      JSON.stringify({
        id,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
