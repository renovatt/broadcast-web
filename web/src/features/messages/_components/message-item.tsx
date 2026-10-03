import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { formatDateTime } from '@/shared/utils/date';
import type { Message } from '../types/message';
import { summarizeRecipients } from '../utils/recipients';

type MessageItemProps = {
  message: Message;
  onEdit: (message: Message) => void;
  onDelete: (message: Message) => void;
};

const MAX_AVATARS = 4;

const statusInfo = (message: Message) =>
  message.status === 'sent'
    ? {
        label: 'Enviada',
        color: 'success' as const,
        icon: <CheckCircleOutlinedIcon />,
        when: message.sentAt ? `em ${formatDateTime(message.sentAt)}` : '',
        bubble: 'border-emerald-100 bg-emerald-50',
      }
    : {
        label: 'Agendada',
        color: 'warning' as const,
        icon: <ScheduleIcon />,
        when: message.scheduledAt ? `para ${formatDateTime(message.scheduledAt)}` : '',
        bubble: 'border-amber-100 bg-amber-50',
      };

const initialOf = (name: string) => name.trim().charAt(0).toUpperCase() || '?';

export const MessageItem = ({ message, onEdit, onDelete }: MessageItemProps) => {
  const status = statusInfo(message);
  const allRecipients = message.recipients.map(({ name }) => name).join(', ');
  const count = message.recipients.length;

  return (
    <Card
      component="article"
      aria-label={`Mensagem ${status.label.toLowerCase()} ${status.when}`}
      className="transition-shadow hover:shadow-md"
    >
      <CardContent className="flex flex-col gap-3">
        <header className="flex items-start gap-2">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
            <Chip
              size="small"
              variant="outlined"
              color={status.color}
              icon={status.icon}
              label={status.label}
            />
            <span className="inline-flex items-center gap-1 text-sm text-gray-500">
              <EventOutlinedIcon fontSize="inherit" aria-hidden="true" />
              {status.when}
            </span>
          </div>
          <div className="-mt-1 -mr-2 flex shrink-0">
            {message.status === 'scheduled' && (
              <Tooltip title="Editar">
                <IconButton
                  size="small"
                  aria-label="Editar mensagem"
                  onClick={() => onEdit(message)}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Excluir">
              <IconButton
                size="small"
                aria-label="Excluir mensagem"
                onClick={() => onDelete(message)}
              >
                <DeleteOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
        </header>

        {/* O conteúdo em um "balão", como numa conversa, com o tom do status. */}
        <div className={`rounded-2xl rounded-tl-sm border px-4 py-3 ${status.bubble}`}>
          <Typography
            variant="body1"
            className="line-clamp-6 whitespace-pre-wrap wrap-break-word text-gray-800"
          >
            {message.body}
          </Typography>
        </div>

        <footer className="flex items-center gap-2" title={allRecipients}>
          <AvatarGroup
            max={MAX_AVATARS}
            aria-hidden="true"
            className="[&_.MuiAvatar-root]:size-6! [&_.MuiAvatar-root]:text-xs!"
          >
            {message.recipients.map((recipient) => (
              <Avatar key={recipient.id}>{initialOf(recipient.name)}</Avatar>
            ))}
          </AvatarGroup>
          <Typography variant="body2" color="text.secondary" className="min-w-0 truncate">
            Para: {summarizeRecipients(message.recipients)}
          </Typography>
          <Typography variant="caption" color="text.secondary" className="ml-auto shrink-0">
            {count} {count === 1 ? 'destinatário' : 'destinatários'}
          </Typography>
        </footer>
      </CardContent>
    </Card>
  );
};
