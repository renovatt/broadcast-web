import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { TruncatedText } from '@/components/truncated-text';
import { ROUTES } from '@/shared/constants/routes';
import { areFunctionsEnabled } from '@/shared/utils/backend';
import { formatDate } from '@/shared/utils/date';
import type { Connection, ConnectionStats } from '../types/connection';

type ConnectionCardProps = {
  connection: Connection;
  onEdit: (connection: Connection) => void;
  onDelete: (connection: Connection) => void;
};

const EMPTY_STATS: ConnectionStats = { contacts: 0, sent: 0, scheduled: 0 };

const plural = (count: number, singular: string, pluralForm: string) =>
  `${count} ${count === 1 ? singular : pluralForm}`;

type StatProps = { icon: ReactNode; label: string; className: string };

const Stat = ({ icon, label, className }: StatProps) => (
  <li
    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
  >
    <span className="flex [&>svg]:size-4!" aria-hidden="true">
      {icon}
    </span>
    {label}
  </li>
);

export const ConnectionCard = ({ connection, onEdit, onDelete }: ConnectionCardProps) => {
  const stats = connection.stats ?? EMPTY_STATS;
  // Sem as Cloud Functions (plano Spark) o resumo nunca é calculado: zeros seriam enganosos.
  const showStats = Boolean(connection.stats) || areFunctionsEnabled();

  return (
    <Card component="article" aria-label={connection.name} className="flex h-full flex-col">
      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <TruncatedText variant="h6" component="h2" text={connection.name} />
            <Typography variant="body2" color="text.secondary">
              Criada em {formatDate(connection.createdAt)}
            </Typography>
          </div>
          <div className="-mt-1 -mr-2 flex shrink-0">
            <Tooltip title="Editar">
              <IconButton
                aria-label={`Editar ${connection.name}`}
                onClick={() => onEdit(connection)}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Excluir">
              <IconButton
                aria-label={`Excluir ${connection.name}`}
                onClick={() => onDelete(connection)}
              >
                <DeleteOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        {/* Resumo em tempo real (mantido pela Cloud Function onContactWritten/onMessageWritten). */}
        {showStats && (
          <ul aria-label="Resumo da conexão" className="m-0 flex list-none flex-wrap gap-2 p-0">
            <Stat
              icon={<PeopleOutlinedIcon />}
              label={plural(stats.contacts, 'contato', 'contatos')}
              className="bg-indigo-50 text-indigo-800"
            />
            <Stat
              icon={<DoneAllIcon />}
              label={plural(stats.sent, 'enviada', 'enviadas')}
              className="bg-emerald-50 text-emerald-800"
            />
            <Stat
              icon={<ScheduleIcon />}
              label={plural(stats.scheduled, 'agendada', 'agendadas')}
              className="bg-amber-50 text-amber-800"
            />
          </ul>
        )}
      </CardContent>
      <CardActions className="border-t border-gray-100 px-4!">
        <Button
          component={RouterLink}
          to={ROUTES.contacts(connection.id)}
          size="small"
          startIcon={<PeopleOutlinedIcon />}
        >
          Contatos
        </Button>
        <Button
          component={RouterLink}
          to={ROUTES.broadcast(connection.id)}
          size="small"
          startIcon={<CampaignOutlinedIcon />}
        >
          Broadcast
        </Button>
      </CardActions>
    </Card>
  );
};
