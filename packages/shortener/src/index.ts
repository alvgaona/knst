import { Context, Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';

type Bindings = {
  URL_STORE: KVNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

app.post('/', async (c: Context) => {
  const { url } = await c.req.json();
  if (!url) {
    throw new HTTPException(400, { message: 'Missing URL in request body' });
  }

  const id = generateId();
  await c.env.URL_STORE.put(id, url);

  const shortenedUrl = `${new URL(c.req.url).origin}/${id}`;
  return c.json({ shortened: shortenedUrl });
});

app.get('/:id', async (c) => {
  const id = c.req.param('id');
  const url = await c.env.URL_STORE.get(id);

  if (url) {
    return c.redirect(url, 301);
  } else {
    throw new HTTPException(404, { message: 'Short URL not found' });
  }
});

function generateId(): string {
  return Math.random().toString(36).substr(2, 6);
}

export default app;
