import { QueryClient, QueryClientProvider } from '@tanstack/solid-query';
import type { ParentComponent } from 'solid-js';

const QueryProvider: ParentComponent = (props) => {
  const client = new QueryClient();

  return (
    <QueryClientProvider client={client}>
      {props.children}
    </QueryClientProvider>
  );
};

export default QueryProvider;
