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
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import { ROUTES } from '@/shared/constants/routes';
import { formatDate } from '@/shared/utils/date';
import type { Connection } from '../types/connection';

type ConnectionCardProps = {
  connection: Connection;
  onEdit: (connection: Connection) => void;
  onDelete: (connection: Connection) => void;
};

export const ConnectionCard = ({ connection, onEdit, onDelete }: ConnectionCardProps) => (
  <Card component="article" aria-label={connection.name} className="flex h-full flex-col">
    <CardContent className="flex flex-1 items-start gap-2">
      <div className="min-w-0 flex-1">
        <Typography variant="h6" component="h2" className="truncate" title={connection.name}>
          {connection.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Criada em {formatDate(connection.createdAt)}
        </Typography>
      </div>
      <div className="-mt-1 -mr-2 flex shrink-0">
        <Tooltip title="Editar">
          <IconButton aria-label={`Editar ${connection.name}`} onClick={() => onEdit(connection)}>
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
