import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import HubIcon from '@mui/icons-material/Hub';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';

// Provisório (Fase 4): a listagem em tempo real e o CRUD de conexões entram na Fase 5.
export const ConnectionsPage = () => (
  <>
    <PageHeader
      title="Conexões"
      subtitle="Cada conexão tem seus próprios contatos e mensagens."
      actions={
        <Button variant="contained" startIcon={<AddIcon />} disabled>
          Nova conexão
        </Button>
      }
    />
    <EmptyState
      icon={<HubIcon />}
      title="Nenhuma conexão ainda"
      description="Crie sua primeira conexão para cadastrar contatos e enviar mensagens."
    />
  </>
);
