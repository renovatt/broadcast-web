import { Link as RouterLink, Outlet, useLocation, useParams } from 'react-router';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { ROUTES } from '@/shared/constants/routes';
import { useConnection, type ConnectionOutletContext } from '../hooks/use-connection';

/** Página de uma conexão: cabeçalho + abas (Contatos | Broadcast) com as páginas filhas. */
export const ConnectionLayout = () => {
  const { connectionId = '' } = useParams();
  const { pathname } = useLocation();
  const { data: connection, loading, error } = useConnection(connectionId);

  if (loading) {
    return (
      <div className="flex justify-center py-16" role="status" aria-label="Carregando conexão">
        <CircularProgress />
      </div>
    );
  }

  // Excluída, inexistente ou de outro cliente (negada pelas rules): mesma resposta, sem vazar dados.
  if (error || !connection) {
    return (
      <EmptyState
        icon={<LinkOffIcon />}
        title="Conexão não encontrada"
        description="Ela pode ter sido excluída ou você não tem acesso a ela."
        action={
          <Button component={RouterLink} to={ROUTES.connections} variant="outlined">
            Voltar para conexões
          </Button>
        }
      />
    );
  }

  const currentTab = pathname.endsWith('/broadcast') ? 'broadcast' : 'contacts';
  const context: ConnectionOutletContext = { connection };

  return (
    <>
      <PageHeader title={connection.name} back={{ label: 'Conexões', to: ROUTES.connections }} />
      <Tabs
        value={currentTab}
        aria-label="Seções da conexão"
        className="mb-6 border-b border-gray-200"
      >
        <Tab
          value="contacts"
          label="Contatos"
          icon={<PeopleOutlinedIcon />}
          iconPosition="start"
          component={RouterLink}
          to={ROUTES.contacts(connection.id)}
        />
        <Tab
          value="broadcast"
          label="Broadcast"
          icon={<CampaignOutlinedIcon />}
          iconPosition="start"
          component={RouterLink}
          to={ROUTES.broadcast(connection.id)}
        />
      </Tabs>
      <Outlet context={context} />
    </>
  );
};
