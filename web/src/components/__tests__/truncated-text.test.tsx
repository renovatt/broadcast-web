import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TruncatedText } from '../truncated-text';

/** jsdom não calcula layout: simula a largura do conteúdo vs. a largura visível. */
const setWidths = (element: HTMLElement, scrollWidth: number, clientWidth: number) => {
  Object.defineProperty(element, 'scrollWidth', { configurable: true, value: scrollWidth });
  Object.defineProperty(element, 'clientWidth', { configurable: true, value: clientWidth });
};

describe('TruncatedText', () => {
  it('renderiza o texto em uma linha com reticências', () => {
    render(<TruncatedText text="WhatsApp Vendas" />);
    expect(screen.getByText('WhatsApp Vendas')).toHaveClass('truncate');
  });

  it('mostra o texto completo no tooltip quando foi cortado', async () => {
    const user = userEvent.setup();
    render(<TruncatedText text="Um nome de conexão muito comprido" />);
    const text = screen.getByText('Um nome de conexão muito comprido');
    setWidths(text, 400, 120);

    await user.hover(text);
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Um nome de conexão muito comprido',
    );
  });

  it('não mostra tooltip quando o texto cabe inteiro', async () => {
    const user = userEvent.setup();
    render(<TruncatedText text="Curto" />);
    const text = screen.getByText('Curto');
    setWidths(text, 50, 120);

    await user.hover(text);
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('repassa variant/component para o Typography', () => {
    render(<TruncatedText text="Título" variant="h6" component="h2" />);
    expect(screen.getByRole('heading', { level: 2, name: 'Título' })).toBeInTheDocument();
  });
});
