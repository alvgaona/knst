import { actions } from 'astro:actions';
import { createEffect, createSignal, For, Show } from 'solid-js';

interface ShortUrl {
  id: number;
  short_code: string;
  url?: string;
}

const FormComponent = ({ siteHost }: { siteHost: string }) => {
  const [shortenedUrl, setShortenedUrl] = createSignal<string>('');
  const [error, setError] = createSignal<string>('');
  const [isLoading, setIsLoading] = createSignal<boolean>(false);
  const [shortUrls, setShortUrls] = createSignal<ShortUrl[]>([]);

  createEffect(async () => {
    try {
      const { data, error } = await actions.getShorts();
      if (error) {
        setError(error.message);
      }
      if (data) {
        setShortUrls(data);
      }
    } catch (err) {
      setError('Failed to load existing short URLs');
    }
  });

  const handleSubmit = async (event: Event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const form = event.target as HTMLFormElement;
      const formData = new FormData(form);

      const { data, error } = await actions.shortenUrl(formData);

      if (error) {
        setError(error.message);
      }

      if (data) {
        setShortenedUrl(data.short_code);
        console.log(data);
        setShortUrls([
          { id: data.id, short_code: data.short_code, url: data.url },
          ...shortUrls(),
        ]);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const { error } = await actions.deleteShort(id);
      if (error) {
        setError(error.message);
      } else {
        setShortUrls(shortUrls().filter((url) => url.id !== id));
      }
    } catch (err) {
      setError('Failed to delete the short URL');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="url"
          name="url"
          placeholder="Enter a URL to shorten"
          required
        />
        <button type="submit" disabled={isLoading()}>
          {isLoading() ? 'Shortening...' : 'Shorten URL'}
        </button>
      </form>

      <Show when={error()}>
        <p class="error" role="alert">
          {error()}
        </p>
      </Show>

      <Show when={shortenedUrl()}>
        <div class="result">
          <p>Shortened URL:</p>
          <a
            href={`http://${siteHost}/${shortenedUrl()}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {`${siteHost}/${shortenedUrl()}`}
          </a>
        </div>
      </Show>

      <Show when={shortUrls().length > 0}>
        <div class="existing-shorts">
          <h3 class="bg-red-500 font-bold">Existing Short URLs:</h3>
          <ul>
            <For each={shortUrls()}>
              {(shortUrl) => (
                <li>
                  <span>{shortUrl.url}</span>
                  <a
                    href={`http://${siteHost}/${shortUrl.short_code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {`${siteHost}/${shortUrl.short_code}`}
                  </a>
                  <button onClick={() => handleDelete(shortUrl.id)}>
                    Delete
                  </button>
                </li>
              )}
            </For>
          </ul>
        </div>
      </Show>
    </div>
  );
};

export default FormComponent;
