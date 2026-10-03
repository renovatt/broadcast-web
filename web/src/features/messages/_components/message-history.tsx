import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import { EmptyState } from '@/components/empty-state';
import { getFirestoreErrorMessage } from '@/shared/utils/firestore';
import type { Message } from '../types/message';
import { countByStatus, filterMessages, type MessageFilter } from '../utils/message-filters';
import { MessageItem } from './message-item';
import { MessageStatusFilter } from './message-status-filter';

type MessageHistoryProps = {
  messages: readonly Message[] | undefined;
  loading: boolean;
  error: Error | undefined;
  filter: MessageFilter;
  onFilterChange: (filter: MessageFilter) => void;
  onEdit: (message: Message) => void;
  onDelete: (message: Message) => void;
};

const EMPTY_FILTER_TEXT: Record<Exclude<MessageFilter, 'all'>, string> = {
  sent: 'Nenhuma mensagem enviada.',
  scheduled: 'Nenhuma mensagem agendada.',
};

export const MessageHistory = ({
  messages,
  loading,
  error,
  filter,
  onFilterChange,
  onEdit,
  onDelete,
}: MessageHistoryProps) => {
  const all = messages ?? [];
  const visible = filterMessages(all, filter);

  const renderList = () => {
    if (error) return <Alert severity="error">{getFirestoreErrorMessage(error)}</Alert>;
    if (loading || !messages) {
      return (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Carregando mensagens">
          {[0, 1].map((key) => (
            <Skeleton key={key} variant="rounded" height={120} />
          ))}
        </div>
      );
    }
    if (all.length === 0) {
      return (
        <EmptyState
          icon={<ForumOutlinedIcon />}
          title="Nenhuma mensagem ainda"
          description="As mensagens enviadas e agendadas desta conexão aparecerão aqui."
        />
      );
    }
    if (visible.length === 0 && filter !== 'all') {
      return (
        <Typography color="text.secondary" className="py-8 text-center">
          {EMPTY_FILTER_TEXT[filter]}
        </Typography>
      );
    }
    return (
      <ul className="m-0 flex list-none flex-col gap-3 p-0" aria-label="Mensagens">
        {visible.map((message) => (
          <li key={message.id}>
            <MessageItem message={message} onEdit={onEdit} onDelete={onDelete} />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <section aria-labelledby="history-title" className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Typography id="history-title" variant="h6" component="h2">
          Mensagens
        </Typography>
        <MessageStatusFilter value={filter} counts={countByStatus(all)} onChange={onFilterChange} />
      </div>
      {renderList()}
    </section>
  );
};
