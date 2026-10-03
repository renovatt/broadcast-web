import { useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import SearchIcon from '@mui/icons-material/Search';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { EmptyState } from '@/components/empty-state';
import { useCurrentConnection } from '@/features/connections/hooks/use-connection';
import { notify } from '@/shared/stores/notification-store';
import { getFirestoreErrorMessage } from '@/shared/utils/firestore';
import { deleteContact } from '../api/contacts-api';
import { ContactFormDialog } from '../_components/contact-form-dialog';
import { ContactsTable } from '../_components/contacts-table';
import { useContacts } from '../hooks/use-contacts';
import type { Contact } from '../types/contact';
import { filterContacts } from '../utils/filter-contacts';

type FormState = { mode: 'create' } | { mode: 'edit'; contact: Contact } | null;

const pluralize = (count: number) => `${count} ${count === 1 ? 'contato' : 'contatos'}`;

export const ContactsPage = () => {
  const connection = useCurrentConnection();
  const { data: contacts, loading, error } = useContacts(connection.id);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<FormState>(null);
  const [toDelete, setToDelete] = useState<Contact | null>(null);

  const filtered = useMemo(() => filterContacts(contacts ?? [], search), [contacts, search]);

  const editingId = form?.mode === 'edit' ? form.contact.id : undefined;
  const takenPhones = useMemo(
    () => (contacts ?? []).filter((contact) => contact.id !== editingId).map(({ phone }) => phone),
    [contacts, editingId],
  );

  const openCreate = () => setForm({ mode: 'create' });

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteContact(toDelete.id);
      notify.success('Contato excluído.');
    } catch (deleteError) {
      notify.error(getFirestoreErrorMessage(deleteError));
      throw deleteError;
    }
  };

  const renderContent = () => {
    if (error) return <Alert severity="error">{getFirestoreErrorMessage(error)}</Alert>;
    if (loading || !contacts) {
      return (
        <div className="flex flex-col gap-2" aria-busy="true" aria-label="Carregando contatos">
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} variant="rounded" height={40} />
          ))}
        </div>
      );
    }
    if (contacts.length === 0) {
      return (
        <EmptyState
          icon={<PeopleOutlinedIcon />}
          title="Nenhum contato nesta conexão"
          description="Adicione contatos para poder enviar mensagens a eles pelo Broadcast."
          action={
            <Button variant="outlined" startIcon={<PersonAddAlt1Icon />} onClick={openCreate}>
              Adicionar contato
            </Button>
          }
        />
      );
    }
    if (filtered.length === 0) {
      return (
        <Typography color="text.secondary" className="py-8 text-center">
          Nenhum contato encontrado para “{search.trim()}”.
        </Typography>
      );
    }
    return (
      <ContactsTable
        contacts={filtered}
        onEdit={(contact) => setForm({ mode: 'edit', contact })}
        onDelete={setToDelete}
      />
    );
  };

  return (
    <section aria-label="Contatos da conexão">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <TextField
          size="small"
          placeholder="Buscar por nome ou telefone"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="sm:w-80"
          slotProps={{
            htmlInput: { 'aria-label': 'Buscar contatos' },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        {contacts && contacts.length > 0 && (
          <Typography variant="body2" color="text.secondary" aria-live="polite">
            {search.trim()
              ? `${filtered.length} de ${pluralize(contacts.length)}`
              : pluralize(contacts.length)}
          </Typography>
        )}
        <Button
          variant="contained"
          startIcon={<PersonAddAlt1Icon />}
          onClick={openCreate}
          className="sm:ml-auto"
        >
          Novo contato
        </Button>
      </div>

      {renderContent()}

      {form && (
        <ContactFormDialog
          connectionId={connection.id}
          contact={form.mode === 'edit' ? form.contact : undefined}
          takenPhones={takenPhones}
          onClose={() => setForm(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={`Excluir "${toDelete?.name ?? ''}"?`}
        description="O contato será removido desta conexão. Mensagens já enviadas continuam no histórico."
        confirmLabel="Excluir"
        destructive
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </section>
  );
};
