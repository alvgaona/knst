import { QueryClient, QueryClientProvider } from '@tanstack/solid-query';
import type { ParentComponent, ParentProps } from 'solid-js';

const client = new QueryClient();

const QueryProvider: ParentComponent = (props: ParentProps) => {
  return (
    <QueryClientProvider client={client}>{props.children}</QueryClientProvider>
  );
};

export default QueryProvider;
