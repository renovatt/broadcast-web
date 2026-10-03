import { useState } from 'react';
import { Link as RouterLink } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { RhfPasswordField } from '@/components/rhf/rhf-password-field';
import { RhfTextField } from '@/components/rhf/rhf-text-field';
import { AuthLayout } from '../_components/auth-layout';
import { GoogleSignInButton } from '../_components/google-sign-in-button';
import { getAuthErrorMessage, signIn } from '../api/auth-api';
import { loginSchema, type LoginValues } from '../schemas/auth-schemas';

export const LoginPage = () => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await signIn(values);
    } catch (error) {
      setSubmitError(getAuthErrorMessage(error));
    }
  });

  return (
    <AuthLayout
      title="Entrar no Broadcast"
      subtitle="Acesse sua conta para gerenciar conexões e mensagens."
      footer={
        <Typography variant="body2">
          Não tem conta?{' '}
          <Link component={RouterLink} to="/signup">
            Cadastre-se
          </Link>
        </Typography>
      }
    >
      <div className="flex flex-col gap-4">
        {submitError && <Alert severity="error">{submitError}</Alert>}
        <GoogleSignInButton disabled={isSubmitting} onError={setSubmitError} />
        <Divider className="text-sm text-gray-500">ou</Divider>
      </div>
      <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
        <RhfTextField
          name="email"
          control={control}
          label="E-mail"
          type="email"
          autoComplete="email"
          autoFocus
        />
        <RhfPasswordField
          name="password"
          control={control}
          label="Senha"
          autoComplete="current-password"
        />
        <Button type="submit" variant="contained" size="large" loading={isSubmitting}>
          Entrar
        </Button>
      </form>
    </AuthLayout>
  );
};
