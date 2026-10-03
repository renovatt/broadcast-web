/**
 * Indica se as Cloud Functions estão publicadas no ambiente. No plano gratuito (Spark) elas não
 * existem: o agendamento não é processado e o resumo das conexões não é calculado.
 * Lido a cada chamada (e não numa constante) para que os testes possam alternar a variável.
 */
export const areFunctionsEnabled = () => import.meta.env.VITE_FUNCTIONS_ENABLED !== 'false';
