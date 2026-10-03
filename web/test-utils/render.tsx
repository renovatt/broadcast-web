import type { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { AppProviders } from '@/app/app-providers';

type RenderOptions = {
  /** Rota inicial do MemoryRouter. */
  route?: string;
};

/**
 * Renderiza com os mesmos providers do app (tema, datas) e um router em memória.
 * Os providers entram como `wrapper`: um `rerender(ui)` mantém a árvore (e o estado) montada.
 */
export const renderWithProviders = (ui: ReactElement, { route = '/' }: RenderOptions = {}) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <AppProviders>
      <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
    </AppProviders>
  );
  return { user: userEvent.setup(), ...render(ui, { wrapper: Wrapper }) };
};
