import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  /** Link de volta exibido acima do título. */
  back?: { label: string; to: string };
  /** Ações à direita (ex.: botão "Nova conexão"). */
  actions?: ReactNode;
};

export const PageHeader = ({ title, subtitle, back, actions }: PageHeaderProps) => (
  <header className="mb-6 flex flex-col gap-1">
    {back && (
      <div>
        <Button
          component={RouterLink}
          to={back.to}
          size="small"
          startIcon={<ArrowBackIcon />}
          className="-ml-2"
        >
          {back.label}
        </Button>
      </div>
    )}
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <Typography variant="h5" component="h1" className="truncate font-bold">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  </header>
);
