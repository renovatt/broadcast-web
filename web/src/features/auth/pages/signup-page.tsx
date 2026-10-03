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
import { getAuthErrorMessage, signUp } from '../api/auth-api';
import { signupSchema, type SignupValues } from '../schemas/auth-schemas';
import { useAuthStore } from '../stores/auth-store';
import { toAuthUser } from '../utils/to-auth-user';

export const SignupPage = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      const user = await signUp(values);
      // O nome é gravado depois da criação da conta: atualiza o store com o usuário completo.
      setUser(toAuthUser(user));
    } catch (error) {
      setSubmitError(getAuthErrorMessage(error));
    }
  });

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Cada conta é um cliente com suas próprias conexões."
      footer={
        <Typography variant="body2">
          Já tem conta?{' '}
          <Link component={RouterLink} to="/login">
            Entrar
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
        <RhfTextField name="name" control={control} label="Nome" autoComplete="name" autoFocus />
        <RhfTextField
          name="email"
          control={control}
          label="E-mail"
          type="email"
          autoComplete="email"
        />
        <RhfPasswordField
          name="password"
          control={control}
          label="Senha"
          autoComplete="new-password"
        />
        <RhfPasswordField
          name="confirmPassword"
          control={control}
          label="Confirmar senha"
          autoComplete="new-password"
        />
        <Button type="submit" variant="contained" size="large" loading={isSubmitting}>
          Criar conta
        </Button>
      </form>
    </AuthLayout>
  );
};
