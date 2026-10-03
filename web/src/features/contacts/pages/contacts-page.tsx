import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import { EmptyState } from '@/components/empty-state';
import { useCurrentConnection } from '@/features/connections/hooks/use-connection';

// Provisório (Fase 5): o CRUD de contatos entra na Fase 6.
export const ContactsPage = () => {
  const connection = useCurrentConnection();
  return (
    <EmptyState
      icon={<PeopleOutlinedIcon />}
      title="Contatos"
      description={`Os contatos de "${connection.name}" aparecerão aqui.`}
    />
  );
};
