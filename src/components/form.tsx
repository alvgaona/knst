import {
  createMutation,
  createQuery,
  useQueryClient,
} from '@tanstack/solid-query';
import { actions } from 'astro:actions';
import { createSignal, For, Show } from 'solid-js';
import QueryProvider from './query-provider';

interface ShortUrl {
  id: number;
  short_code: string;
  url?: string;
}

const FormQueryComponent = ({ siteHost }: { siteHost: string }) => {
  const [shortenedUrl, setShortenedUrl] = createSignal<string>('');
  const [error, setError] = createSignal<string>('');

  const queryClient = useQueryClient();

  const shortsQuery = createQuery(() => ({
    queryKey: ['shorts'],
    queryFn: async () => {
      const { data, error } = await actions.getShorts();
      if (error) throw new Error(error.message);
      return data as ShortUrl[];
    },
  }));

  const shortenMutation = createMutation(() => ({
    mutationFn: async (formData: FormData) => {
      const { data, error } = await actions.shortenUrl(formData);
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (data: any) => {
      setShortenedUrl(data.short_code);
      queryClient.setQueryData(['shorts'], (old: ShortUrl[] | undefined) => [
        { id: data.id, short_code: data.short_code, url: data.url },
        ...(old || []),
      ]);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  }));

  const deleteMutation = createMutation(() => ({
    mutationFn: async (id: number) => {
      const { error } = await actions.deleteShort(id);
      if (error) throw new Error(error.message);
    },
    onSuccess: (_data: void, id: number) => {
      queryClient.setQueryData(['shorts'], (old: ShortUrl[] | undefined) =>
        old ? old.filter((url) => url.id !== id) : [],
      );
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  }));

  const handleSubmit = async (event: Event) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    shortenMutation.mutate(formData);
  };

  const handleDelete = async (id: number) => {
    deleteMutation.mutate(id);
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
        <button type="submit" disabled={shortenMutation.isPending}>
          {shortenMutation.isPending ? 'Shortening...' : 'Shorten URL'}
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

      <Show when={shortsQuery.data && shortsQuery.data.length > 0}>
        <div class="existing-shorts">
          <h3 class="bg-red-500 font-bold">Existing Short URLs:</h3>
          <ul>
            <For each={shortsQuery.data}>
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

const FormComponent = ({ siteHost }: { siteHost: string }) => (
  <QueryProvider>
    <FormQueryComponent siteHost={siteHost} />
  </QueryProvider>
);

export default FormComponent;
