import { useMemo, useState } from 'react';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import type { Contact } from '@/features/contacts/types/contact';
import { filterContacts } from '@/features/contacts/utils/filter-contacts';
import { formatPhone } from '@/shared/utils/phone';

type RecipientPickerProps = {
  contacts: readonly Contact[];
  value: readonly string[];
  onChange: (ids: string[]) => void;
  error?: string;
};

/** A busca aparece quando a lista começa a ficar longa. */
const SEARCH_THRESHOLD = 6;

export const RecipientPicker = ({ contacts, value, onChange, error }: RecipientPickerProps) => {
  const [search, setSearch] = useState('');
  const visible = useMemo(() => filterContacts(contacts, search), [contacts, search]);
  const selected = new Set(value);

  const visibleSelected = visible.filter(({ id }) => selected.has(id)).length;
  const allVisibleSelected = visible.length > 0 && visibleSelected === visible.length;

  const toggle = (id: string) =>
    onChange(selected.has(id) ? value.filter((item) => item !== id) : [...value, id]);

  // "Selecionar todos" age sobre os contatos visíveis (respeita a busca).
  const toggleAllVisible = () => {
    const visibleIds = new Set(visible.map(({ id }) => id));
    onChange(
      allVisibleSelected
        ? value.filter((id) => !visibleIds.has(id))
        : [...new Set([...value, ...visibleIds])],
    );
  };

  return (
    <fieldset className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0">
      <legend className="mb-1 text-sm font-medium">Destinatários</legend>

      {contacts.length >= SEARCH_THRESHOLD && (
        <TextField
          size="small"
          placeholder="Buscar contato"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          slotProps={{
            htmlInput: { 'aria-label': 'Buscar destinatários' },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
      )}

      <div
        className={`rounded-lg border ${error ? 'border-(--mui-palette-error-main)' : 'border-gray-300'}`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-2">
          <FormControlLabel
            label={search.trim() ? 'Selecionar resultados' : 'Selecionar todos'}
            control={
              <Checkbox
                size="small"
                checked={allVisibleSelected}
                indeterminate={visibleSelected > 0 && !allVisibleSelected}
                onChange={toggleAllVisible}
                disabled={visible.length === 0}
              />
            }
          />
          <Typography variant="body2" color="text.secondary" aria-live="polite">
            {value.length} {value.length === 1 ? 'selecionado' : 'selecionados'}
          </Typography>
        </div>

        <ul className="m-0 max-h-56 list-none overflow-y-auto p-0 px-2" aria-label="Contatos">
          {visible.map((contact) => (
            <li key={contact.id}>
              <FormControlLabel
                className="w-full"
                control={
                  <Checkbox
                    size="small"
                    checked={selected.has(contact.id)}
                    onChange={() => toggle(contact.id)}
                  />
                }
                label={
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    <span>{contact.name}</span>
                    <span className="text-xs text-gray-500 tabular-nums">
                      {formatPhone(contact.phone)}
                    </span>
                  </span>
                }
              />
            </li>
          ))}
          {visible.length === 0 && (
            <li className="py-3 text-center text-sm text-gray-500">Nenhum contato encontrado.</li>
          )}
        </ul>
      </div>

      {error && <FormHelperText error>{error}</FormHelperText>}
    </fieldset>
  );
};
