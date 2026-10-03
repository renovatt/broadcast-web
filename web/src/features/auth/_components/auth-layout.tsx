import type { ReactNode } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CampaignIcon from '@mui/icons-material/Campaign';

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
};

export const AuthLayout = ({ title, subtitle, children, footer }: AuthLayoutProps) => (
  <main className="flex min-h-screen items-center justify-center px-4 py-10">
    <Card className="w-full max-w-md">
      <CardContent className="flex flex-col gap-6 p-6! sm:p-8!">
        <header className="flex flex-col items-center gap-2 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-(--mui-palette-primary-main) text-white">
            <CampaignIcon />
          </span>
          <Typography variant="h5" component="h1" className="font-bold">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </header>
        {children}
        <footer className="text-center">{footer}</footer>
      </CardContent>
    </Card>
  </main>
);
