import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import { EmptyState } from '@/components/empty-state';
import { useCurrentConnection } from '@/features/connections/hooks/use-connection';

// Provisório (Fase 5): envio e agendamento de mensagens entram na Fase 7.
export const BroadcastPage = () => {
  const connection = useCurrentConnection();
  return (
    <EmptyState
      icon={<CampaignOutlinedIcon />}
      title="Broadcast"
      description={`O envio de mensagens para os contatos de "${connection.name}" aparecerá aqui.`}
    />
  );
};
