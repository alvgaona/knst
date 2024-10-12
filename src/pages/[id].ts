import type { APIRoute } from 'astro';
import { neon } from '@neondatabase/serverless';

export const GET: APIRoute = async ({ params }) => {
    const { id } = params;

    if (!id) {
        return new Response('Short code is required', { status: 400 })
    }

    try {
        const sql = neon(import.meta.env.DATABASE_URL);

        const result = await sql`
                UPDATE url_shortener
                SET access_count = access_count + 1, last_accessed = NOW()
                WHERE short_code = ${id}
                RETURNING original_url
            `;

        if (result && result.length > 0) {
            const { original_url } = result[0];
            return new Response(
                null, {
                status: 302,
                headers: {
                    Location: original_url
                }
            }
            );
        } else {
            return new Response('Short URL not found', { status: 404 });
        }
    } catch (error) {
        console.error('Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
};
