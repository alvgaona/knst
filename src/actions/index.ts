import { neon } from '@neondatabase/serverless';
import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';

const sql = neon(import.meta.env.DATABASE_URL);

function generateId(): string {
  return Math.random().toString(36).substring(2, 6);
}

export const server = {
  deleteShort: defineAction({
    handler: async (id: string) => {
      try {
        const result = await sql`
                    DELETE FROM url_shortener
                    WHERE id = ${id}
                    RETURNING id
                `;

        if (result && result.length > 0) {
          return { success: true, deletedId: result[0].id };
        } else {
          throw new ActionError({
            code: 'NOT_FOUND',
            message: 'Short URL not found or could not be deleted',
          });
        }
      } catch (err) {
        console.error('Error deleting short URL:', err);
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
        });
      }
    },
  }),
  getShorts: defineAction({
    handler: async () => {
      const result =
        await sql`SELECT id, short_code, original_url FROM url_shortener`;
      return result.map((row) => ({
        short_code: row.short_code,
        id: row.id,
        url: row.original_url,
      }));
    },
  }),
  shortenUrl: defineAction({
    accept: 'form',
    input: z.object({
      url: z.string().url({ message: 'It must be a valid URL' }),
    }),
    handler: async (input) => {
      try {
        const shortCode = generateId();

        const result = await sql`
                    INSERT INTO url_shortener (original_url, short_code, created_at, access_count)
                    VALUES (${input.url}, ${shortCode}, NOW(), 0)
                    RETURNING id, short_code, original_url
                `;

        if (result && result.length > 0) {
          const { id, short_code, original_url } = result[0];
          return {
            id,
            short_code,
            url: original_url,
          };
        } else {
          throw new ActionError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Could not shorten the provided URL',
          });
        }
      } catch (err) {
        console.error('Error shortening URL:', err);
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error ocurred',
        });
      }
    },
  }),
};
