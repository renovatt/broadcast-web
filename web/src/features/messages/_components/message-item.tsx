import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
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
        when: message.sentAt ? `em ${formatDateTime(message.sentAt)}` : '',
        date: message.sentAt ? formatDateTime(message.sentAt) : '',
        icon: <DoneAllIcon />,
        bubble: 'border-emerald-100 bg-emerald-50',
        meta: 'text-emerald-700',
      }
    : {
        label: 'Agendada',
        when: message.scheduledAt ? `para ${formatDateTime(message.scheduledAt)}` : '',
        date: message.scheduledAt ? formatDateTime(message.scheduledAt) : '',
        icon: <ScheduleIcon />,
        bubble: 'border-amber-100 bg-amber-50',
        meta: 'text-amber-700',
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
        {/* Destinatários no topo */}
        <header className="flex items-center gap-2">
          <AvatarGroup
            max={MAX_AVATARS}
            aria-hidden="true"
            className="[&_.MuiAvatar-root]:size-7! [&_.MuiAvatar-root]:text-xs!"
          >
            {message.recipients.map((recipient) => (
              <Avatar key={recipient.id}>{initialOf(recipient.name)}</Avatar>
            ))}
          </AvatarGroup>
          {/* Tooltip ancorado só no texto e acima dele, para não cobrir o balão da mensagem. */}
          <Tooltip title={allRecipients} placement="top-start" arrow>
            <div className="min-w-0">
              <Typography variant="body2" className="truncate font-medium">
                Para: {summarizeRecipients(message.recipients)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {count} {count === 1 ? 'destinatário' : 'destinatários'}
              </Typography>
            </div>
          </Tooltip>
          <div className="-mr-2 ml-auto flex shrink-0">
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

        {/* Balão da mensagem: texto + status e data no rodapé, como num app de conversa. */}
        <div className={`rounded-2xl rounded-tl-sm border px-4 pt-3 pb-2 ${status.bubble}`}>
          <Typography
            variant="body1"
            className="line-clamp-6 whitespace-pre-wrap wrap-break-word text-gray-800"
          >
            {message.body}
          </Typography>
          <p className={`m-0 mt-1 flex items-center justify-end gap-1 text-xs ${status.meta}`}>
            {/* Leitores de tela leem a frase completa; a versão visual compacta fica oculta para eles. */}
            <span className="sr-only">
              {status.label} {status.when}
            </span>
            <span aria-hidden="true">
              {status.label} · {status.date}
            </span>
            <span className="flex [&>svg]:size-4!" aria-hidden="true">
              {status.icon}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
