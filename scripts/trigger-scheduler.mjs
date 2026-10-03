// Simula o Cloud Scheduler no ambiente local.
// O emulador de Functions não executa funções agendadas sozinho. Para funções v2 (onSchedule)
// ele também não consegue acioná-las pelo Pub/Sub ("Unsupported trigger signature: http"),
// mas as expõe como endpoint HTTP — que é o que este script chama.
// O emulador de Pub/Sub precisa estar ativo (firebase.json): sem ele a função nem é carregada.
// Uso:
//   node scripts/trigger-scheduler.mjs           → um disparo
//   node scripts/trigger-scheduler.mjs --watch   → um disparo por minuto (como em produção)
const FUNCTIONS_HOST = process.env.FUNCTIONS_EMULATOR_HOST ?? '127.0.0.1:5001';
const PROJECT_ID = process.env.GCLOUD_PROJECT ?? 'demo-broadcast';
const REGION = 'southamerica-east1';
const FUNCTION_ID = 'dispatchScheduledMessages-0';
const INTERVAL_MS = 60_000;

const trigger = async () => {
  const response = await fetch(`http://${FUNCTIONS_HOST}/${PROJECT_ID}/${REGION}/${FUNCTION_ID}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });
  if (!response.ok) {
    throw new Error(
      `Falha ao acionar dispatchScheduledMessages (${response.status}). Os emuladores estão rodando?`,
    );
  }
  console.log(`[${new Date().toLocaleTimeString('pt-BR')}] dispatchScheduledMessages executada`);
};

const run = async () => {
  await trigger();
  if (process.argv.includes('--watch')) {
    setInterval(() => trigger().catch((error) => console.error(error.message)), INTERVAL_MS);
  }
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
