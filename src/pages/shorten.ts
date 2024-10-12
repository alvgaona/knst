import { neon } from '@neondatabase/serverless';
import type { APIRoute } from 'astro';

function generateId(): string {
  return Math.random().toString(36).substr(2, 6);
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const sql = neon(import.meta.env.DATABASE_URL);
    const res = await sql`select * from url_shortener`;

    console.log(res);

    const body = await request.json();

    const { url } = body;

    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const shortCode = generateId();

    const result = await sql`
            INSERT INTO url_shortener (original_url, short_code, created_at, access_count)
            VALUES (${url}, ${shortCode}, NOW(), 0)
            RETURNING id, short_code
        `;

    if (result && result.length > 0) {
      const { id, short_code } = result[0];
      return new Response(
        JSON.stringify({
          id,
          shortCode: short_code,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    } else {
      throw new Error('Failed to insert data');
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
