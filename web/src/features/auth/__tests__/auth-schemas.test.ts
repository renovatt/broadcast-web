import { describe, expect, it } from 'vitest';
import { loginSchema, signupSchema } from '../schemas/auth-schemas';

const firstError = (result: { success: boolean; error?: { issues: { message: string }[] } }) =>
  result.error?.issues[0]?.message;

describe('loginSchema', () => {
  it('aceita e-mail e senha válidos (normalizando espaços do e-mail)', () => {
    const result = loginSchema.safeParse({ email: '  joao@teste.com ', password: 'x' });
    expect(result.success).toBe(true);
    expect(result.data?.email).toBe('joao@teste.com');
  });

  it('exige e-mail', () => {
    expect(firstError(loginSchema.safeParse({ email: '', password: 'x' }))).toBe(
      'Informe o e-mail.',
    );
  });

  it('rejeita e-mail inválido', () => {
    expect(firstError(loginSchema.safeParse({ email: 'joao', password: 'x' }))).toBe(
      'E-mail inválido.',
    );
  });

  it('exige senha', () => {
    expect(firstError(loginSchema.safeParse({ email: 'joao@teste.com', password: '' }))).toBe(
      'Informe a senha.',
    );
  });
});

describe('signupSchema', () => {
  const valid = {
    name: 'João',
    email: 'joao@teste.com',
    password: 'segredo123',
    confirmPassword: 'segredo123',
  };

  it('aceita dados válidos', () => {
    expect(signupSchema.safeParse(valid).success).toBe(true);
  });

  it('exige nome com pelo menos 2 caracteres', () => {
    expect(firstError(signupSchema.safeParse({ ...valid, name: ' J ' }))).toBe('Informe seu nome.');
  });

  it('limita o nome a 80 caracteres', () => {
    expect(firstError(signupSchema.safeParse({ ...valid, name: 'x'.repeat(81) }))).toBe(
      'Máximo de 80 caracteres.',
    );
  });

  it('exige senha com pelo menos 6 caracteres', () => {
    const result = signupSchema.safeParse({ ...valid, password: '123', confirmPassword: '123' });
    expect(firstError(result)).toBe('A senha deve ter pelo menos 6 caracteres.');
  });

  it('exige que as senhas confiram, apontando o erro para confirmPassword', () => {
    const result = signupSchema.safeParse({ ...valid, confirmPassword: 'outra123' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]).toMatchObject({
      message: 'As senhas não conferem.',
      path: ['confirmPassword'],
    });
  });
});
