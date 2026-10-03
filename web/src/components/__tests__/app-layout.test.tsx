import { describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderWithProviders } from '@test-utils/render';
import { AppLayout } from '../app-layout';

const renderLayout = (user = { displayName: 'João Silva', email: 'joao@teste.com' }) => {
  const onSignOut = vi.fn();
  const result = renderWithProviders(
    <AppLayout user={user} homePath="/connections" onSignOut={onSignOut}>
      <p>conteúdo da página</p>
    </AppLayout>,
  );
  return { ...result, onSignOut };
};

describe('AppLayout', () => {
  it('renderiza a marca com link para a home e o conteúdo', () => {
    renderLayout();
    expect(screen.getByRole('link', { name: 'Broadcast — início' })).toHaveAttribute(
      'href',
      '/connections',
    );
    expect(screen.getByRole('main')).toHaveTextContent('conteúdo da página');
  });

  it('mostra as iniciais do usuário no avatar', () => {
    renderLayout();
    expect(screen.getByRole('button', { name: 'Conta' })).toHaveTextContent('JS');
  });

  it('usa o e-mail quando não há nome', () => {
    renderLayout({ displayName: null, email: 'maria@teste.com' } as never);
    expect(screen.getByRole('button', { name: 'Conta' })).toHaveTextContent('M');
  });

  it('abre o menu da conta com nome, e-mail e Sair', async () => {
    const { user, onSignOut } = renderLayout();

    await user.click(screen.getByRole('button', { name: 'Conta' }));
    // Nome e e-mail ficam fora do role="menu" (que só aceita itens de menu).
    const menu = screen.getByRole('menu', { name: 'Conta' });
    expect(within(menu).queryByText('João Silva')).not.toBeInTheDocument();
    const popover = menu.closest<HTMLElement>('.MuiPopover-paper')!;
    expect(within(popover).getByText('João Silva')).toBeInTheDocument();
    expect(within(popover).getByText('joao@teste.com')).toBeInTheDocument();

    await user.click(within(menu).getByRole('menuitem', { name: 'Sair' }));
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it('o foco vai direto para o item "Sair" ao abrir o menu (teclado)', async () => {
    const { user } = renderLayout();
    await user.click(screen.getByRole('button', { name: 'Conta' }));
    expect(screen.getByRole('menuitem', { name: 'Sair' })).toHaveFocus();
  });
});
