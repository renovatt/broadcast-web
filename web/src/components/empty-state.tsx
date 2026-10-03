import type { ReactNode } from 'react';
import Typography from '@mui/material/Typography';

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

/** Mensagem para listas vazias, com uma ação opcional (ex.: "Criar primeira conexão"). */
export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <section className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-300 px-6 py-12 text-center">
    <span className="text-gray-400 [&>svg]:size-12!" aria-hidden="true">
      {icon}
    </span>
    <Typography variant="h6" component="h2">
      {title}
    </Typography>
    {description && (
      <Typography variant="body2" color="text.secondary" className="max-w-sm">
        {description}
      </Typography>
    )}
    {action && <div className="mt-2">{action}</div>}
  </section>
);
