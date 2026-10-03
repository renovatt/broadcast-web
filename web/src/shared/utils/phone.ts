/** E.164: "+" seguido de 8 a 15 dígitos, sem zero inicial (mesma regra do firestore.rules). */
export const E164_PATTERN = /^\+[1-9]\d{7,14}$/;

const BRAZIL_CODE = '55';

/**
 * Normaliza o que o usuário digitou para E.164.
 * - "+1 (415) 555-2671" → "+14155552671" (código do país explícito é mantido)
 * - "(11) 99999-8888"  → "+5511999998888" (sem "+", o número é tratado como brasileiro)
 * - "5511999998888"    → "+5511999998888"
 * - "9999-8888"        → "99998888" (sem DDD: fica fora do E.164 e é rejeitado)
 * O resultado pode ser inválido; use `isValidPhone` para conferir.
 */
export const normalizePhone = (input: string) => {
  const trimmed = input.trim();
  const digits = trimmed.replace(/\D/g, '');
  if (trimmed.startsWith('+')) return `+${digits}`;
  // Sem "+": só aceitamos número brasileiro — DDD + número (10/11) ou 55 + DDD + número (12/13).
  if (digits.length === 10 || digits.length === 11) return `+${BRAZIL_CODE}${digits}`;
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith(BRAZIL_CODE)) {
    return `+${digits}`;
  }
  return digits;
};

/** Brasil: +55, DDD (2 dígitos) e número de 8 (fixo) ou 9 (celular) dígitos. */
const BRAZIL_PATTERN = /^\+55\d{10,11}$/;

/** E.164 válido; números do Brasil (+55) também precisam ter DDD + 8/9 dígitos. */
export const isValidPhone = (phone: string) =>
  E164_PATTERN.test(phone) && (!phone.startsWith(`+${BRAZIL_CODE}`) || BRAZIL_PATTERN.test(phone));

/**
 * Formato nacional (o mesmo da máscara do campo): "(11) 99999-8888" / "(11) 3333-4444".
 * Números de outros países são devolvidos em E.164.
 */
export const formatPhoneNational = (phone: string) => {
  const brazil = /^\+55(\d{2})(\d{4,5})(\d{4})$/.exec(phone);
  if (!brazil) return phone;
  const [, area, prefix, suffix] = brazil;
  return `(${area}) ${prefix}-${suffix}`;
};

/**
 * Exibição amigável de um telefone E.164.
 * Brasil: "+55 11 99999-8888" / "+55 11 3333-4444". Outros países: devolve o E.164.
 */
export const formatPhone = (phone: string) => {
  const brazil = /^\+55(\d{2})(\d{4,5})(\d{4})$/.exec(phone);
  if (!brazil) return phone;
  const [, area, prefix, suffix] = brazil;
  return `+55 ${area} ${prefix}-${suffix}`;
};
