import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
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

const statusInfo = (message: Message) =>
  message.status === 'sent'
    ? {
        label: 'Enviada',
        color: 'success' as const,
        icon: <CheckCircleOutlinedIcon />,
        when: message.sentAt ? `em ${formatDateTime(message.sentAt)}` : '',
      }
    : {
        label: 'Agendada',
        color: 'warning' as const,
        icon: <ScheduleIcon />,
        when: message.scheduledAt ? `para ${formatDateTime(message.scheduledAt)}` : '',
      };

export const MessageItem = ({ message, onEdit, onDelete }: MessageItemProps) => {
  const status = statusInfo(message);
  const allRecipients = message.recipients.map(({ name }) => name).join(', ');

  return (
    <Card component="article" aria-label={`Mensagem ${status.label.toLowerCase()} ${status.when}`}>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-start gap-2">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <Chip
              size="small"
              variant="outlined"
              color={status.color}
              icon={status.icon}
              label={status.label}
            />
            <Typography variant="body2" color="text.secondary">
              {status.when}
            </Typography>
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
        </div>

        <Typography variant="body1" className="line-clamp-4 break-words whitespace-pre-wrap">
          {message.body}
        </Typography>

        <Typography variant="body2" color="text.secondary" title={allRecipients}>
          Para: {summarizeRecipients(message.recipients)}
        </Typography>
      </CardContent>
    </Card>
  );
};
