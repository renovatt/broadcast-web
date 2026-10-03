import { z } from 'zod';

const email = z.string().trim().min(1, 'Informe o e-mail.').pipe(z.email('E-mail inválido.'));

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Informe a senha.'),
});

export const signupSchema = z
  .object({
    name: z.string().trim().min(2, 'Informe seu nome.').max(80, 'Máximo de 80 caracteres.'),
    email,
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'As senhas não conferem.',
    path: ['confirmPassword'],
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
