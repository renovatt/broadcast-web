import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FirebaseError } from 'firebase/app';
import { MemoryRouter, Route, Routes } from 'react-router';
import { AppProviders } from '@/app/app-providers';
import { useConnection, useCurrentConnection } from '../hooks/use-connection';
import { ConnectionLayout } from '../pages/connection-layout';
import type { Connection } from '../types/connection';

vi.mock('../hooks/use-connection', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../hooks/use-connection')>()),
  useConnection: vi.fn(),
}));

const connection = { id: 'c1', name: 'WhatsApp Vendas' } as Connection;

const Child = ({ label }: { label: string }) => (
  <p>
    {label}: {useCurrentConnection().name}
  </p>
);

const renderAt = (path: string, state: Partial<ReturnType<typeof useConnection>>) => {
  vi.mocked(useConnection).mockReturnValue({
    data: undefined,
    error: undefined,
    loading: false,
    ...state,
  });
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/connections/:connectionId" element={<ConnectionLayout />}>
            <Route path="contacts" element={<Child label="contatos" />} />
            <Route path="broadcast" element={<Child label="broadcast" />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AppProviders>,
  );
};

describe('ConnectionLayout', () => {
  it('busca a conexão pelo id da rota e mostra carregamento', () => {
    renderAt('/connections/c1/contacts', { loading: true });
    expect(useConnection).toHaveBeenCalledWith('c1');
    expect(screen.getByRole('status', { name: 'Carregando conexão' })).toBeInTheDocument();
  });

  it('mostra "não encontrada" quando a conexão não existe', () => {
    renderAt('/connections/c1/contacts', { data: null });
    expect(screen.getByRole('heading', { name: 'Conexão não encontrada' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar para conexões' })).toHaveAttribute(
      'href',
      '/connections',
    );
  });

  it('trata acesso negado (conexão de outro cliente) como não encontrada', () => {
    renderAt('/connections/c1/contacts', { error: new FirebaseError('permission-denied', 'x') });
    expect(screen.getByRole('heading', { name: 'Conexão não encontrada' })).toBeInTheDocument();
  });

  it('mostra o cabeçalho, as abas e a página filha com a conexão no contexto', () => {
    renderAt('/connections/c1/contacts', { data: connection });

    expect(screen.getByRole('heading', { level: 1, name: 'WhatsApp Vendas' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Conexões' })).toHaveAttribute('href', '/connections');
    expect(screen.getByRole('tab', { name: 'Contatos' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('contatos: WhatsApp Vendas')).toBeInTheDocument();
  });

  it('marca a aba Broadcast e aponta a outra aba para contatos', () => {
    renderAt('/connections/c1/broadcast', { data: connection });

    expect(screen.getByRole('tab', { name: 'Broadcast' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('broadcast: WhatsApp Vendas')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Contatos' })).toHaveAttribute(
      'href',
      '/connections/c1/contacts',
    );
  });
});
