import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import type { MessageFilter } from '../utils/message-filters';

type MessageStatusFilterProps = {
  value: MessageFilter;
  counts: Record<MessageFilter, number>;
  onChange: (filter: MessageFilter) => void;
};

const OPTIONS: { value: MessageFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'sent', label: 'Enviadas' },
  { value: 'scheduled', label: 'Agendadas' },
];

export const MessageStatusFilter = ({ value, counts, onChange }: MessageStatusFilterProps) => (
  <ToggleButtonGroup
    exclusive
    size="small"
    value={value}
    // Clicar no filtro já ativo devolve null: mantém o atual.
    onChange={(_, next: MessageFilter | null) => next && onChange(next)}
    aria-label="Filtrar mensagens"
  >
    {OPTIONS.map((option) => (
      <ToggleButton key={option.value} value={option.value} className="px-3! normal-case!">
        {option.label} ({counts[option.value]})
      </ToggleButton>
    ))}
  </ToggleButtonGroup>
);
