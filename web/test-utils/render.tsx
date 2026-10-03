import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { AppProviders } from '@/app/app-providers';

type RenderOptions = {
  /** Rota inicial do MemoryRouter. */
  route?: string;
};

/** Renderiza com os mesmos providers do app (tema, datas) e um router em memória. */
export const renderWithProviders = (ui: ReactElement, { route = '/' }: RenderOptions = {}) => ({
  user: userEvent.setup(),
  ...render(
    <AppProviders>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </AppProviders>,
  ),
});
