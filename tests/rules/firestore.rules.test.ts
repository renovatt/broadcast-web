import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
  type Firestore,
} from 'firebase/firestore';

const ALICE = 'alice';
const BOB = 'bob';
const HOUR = 60 * 60 * 1000;

let testEnv: RulesTestEnvironment;

const dbAs = (uid: string): Firestore =>
  testEnv.authenticatedContext(uid).firestore() as unknown as Firestore;

const anonymousDb = (): Firestore =>
  testEnv.unauthenticatedContext().firestore() as unknown as Firestore;

const inHours = (hours: number) => Timestamp.fromMillis(Date.now() + hours * HOUR);

const recipient = { id: 'alice-contact', name: 'Maria', phone: '+5511999998888' };

const newConnection = (tenantId: string, overrides: DocumentData = {}) => ({
  tenantId,
  name: 'WhatsApp Vendas',
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  ...overrides,
});

const newContact = (tenantId: string, connectionId: string, overrides: DocumentData = {}) => ({
  tenantId,
  connectionId,
  name: 'Maria',
  phone: '+5511999998888',
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  ...overrides,
});

const newMessage = (tenantId: string, connectionId: string, overrides: DocumentData = {}) => ({
  tenantId,
  connectionId,
  body: 'Olá!',
  recipientIds: [recipient.id],
  recipients: [recipient],
  status: 'sent',
  scheduledAt: null,
  sentAt: serverTimestamp(),
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  ...overrides,
});

const scheduledOverrides = (hours: number) => ({
  status: 'scheduled',
  scheduledAt: inHours(hours),
  sentAt: null,
});

/** Dados iniciais gravados sem passar pelas regras: Alice e Bob com uma conexão, um contato e mensagens cada. */
const seed = () =>
  testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore() as unknown as Firestore;
    const now = Timestamp.now();
    const base = { createdAt: now, updatedAt: now };

    await setDoc(doc(db, 'connections/alice-conn'), { tenantId: ALICE, name: 'Alice', ...base });
    await setDoc(doc(db, 'connections/bob-conn'), { tenantId: BOB, name: 'Bob', ...base });

    await setDoc(doc(db, 'contacts/alice-contact'), {
      tenantId: ALICE,
      connectionId: 'alice-conn',
      name: 'Maria',
      phone: '+5511999998888',
      ...base,
    });
    await setDoc(doc(db, 'contacts/bob-contact'), {
      tenantId: BOB,
      connectionId: 'bob-conn',
      name: 'João',
      phone: '+5521988887777',
      ...base,
    });

    const message = {
      body: 'Olá!',
      recipientIds: [recipient.id],
      recipients: [recipient],
      ...base,
    };
    await setDoc(doc(db, 'messages/alice-scheduled'), {
      ...message,
      tenantId: ALICE,
      connectionId: 'alice-conn',
      status: 'scheduled',
      scheduledAt: inHours(2),
      sentAt: null,
    });
    await setDoc(doc(db, 'messages/alice-sent'), {
      ...message,
      tenantId: ALICE,
      connectionId: 'alice-conn',
      status: 'sent',
      scheduledAt: null,
      sentAt: now,
    });
    await setDoc(doc(db, 'messages/bob-scheduled'), {
      ...message,
      tenantId: BOB,
      connectionId: 'bob-conn',
      status: 'scheduled',
      scheduledAt: inHours(2),
      sentAt: null,
    });
  });

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-broadcast',
    firestore: {
      rules: readFileSync(resolve(import.meta.dirname, '../../firestore.rules'), 'utf8'),
    },
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  await seed();
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('usuário não autenticado', () => {
  it('não lê nenhuma coleção', async () => {
    const db = anonymousDb();
    await assertFails(getDoc(doc(db, 'connections/alice-conn')));
    await assertFails(getDoc(doc(db, 'contacts/alice-contact')));
    await assertFails(getDoc(doc(db, 'messages/alice-sent')));
  });

  it('não cria conexão', async () => {
    await assertFails(setDoc(doc(anonymousDb(), 'connections/x'), newConnection(ALICE)));
  });
});

describe('connections', () => {
  it('dono lê a própria conexão; outro cliente não', async () => {
    await assertSucceeds(getDoc(doc(dbAs(ALICE), 'connections/alice-conn')));
    await assertFails(getDoc(doc(dbAs(ALICE), 'connections/bob-conn')));
  });

  it('listagem só é permitida filtrando pelo próprio tenantId', async () => {
    const db = dbAs(ALICE);
    await assertSucceeds(
      getDocs(query(collection(db, 'connections'), where('tenantId', '==', ALICE))),
    );
    await assertFails(getDocs(collection(db, 'connections')));
    await assertFails(getDocs(query(collection(db, 'connections'), where('tenantId', '==', BOB))));
  });

  it('cria conexão para si mesmo com timestamps do servidor', async () => {
    await assertSucceeds(setDoc(doc(dbAs(ALICE), 'connections/new'), newConnection(ALICE)));
  });

  it('não cria conexão em nome de outro cliente', async () => {
    await assertFails(setDoc(doc(dbAs(ALICE), 'connections/new'), newConnection(BOB)));
  });

  it('rejeita campos extras, nome inválido e timestamps do cliente', async () => {
    const db = dbAs(ALICE);
    await assertFails(setDoc(doc(db, 'connections/a'), newConnection(ALICE, { admin: true })));
    await assertFails(setDoc(doc(db, 'connections/b'), newConnection(ALICE, { name: '   ' })));
    await assertFails(
      setDoc(doc(db, 'connections/c'), newConnection(ALICE, { name: 'x'.repeat(81) })),
    );
    await assertFails(
      setDoc(doc(db, 'connections/d'), newConnection(ALICE, { createdAt: Timestamp.now() })),
    );
  });

  it('dono renomeia a conexão', async () => {
    await assertSucceeds(
      updateDoc(doc(dbAs(ALICE), 'connections/alice-conn'), {
        name: 'Novo nome',
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it('não transfere a conexão para outro cliente', async () => {
    await assertFails(
      updateDoc(doc(dbAs(ALICE), 'connections/alice-conn'), {
        tenantId: BOB,
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it('não edita nem exclui conexão de outro cliente', async () => {
    const db = dbAs(ALICE);
    await assertFails(
      updateDoc(doc(db, 'connections/bob-conn'), { name: 'hack', updatedAt: serverTimestamp() }),
    );
    await assertFails(deleteDoc(doc(db, 'connections/bob-conn')));
  });

  it('dono exclui a própria conexão', async () => {
    await assertSucceeds(deleteDoc(doc(dbAs(ALICE), 'connections/alice-conn')));
  });
});

describe('contacts', () => {
  it('dono lê o próprio contato; outro cliente não', async () => {
    await assertSucceeds(getDoc(doc(dbAs(ALICE), 'contacts/alice-contact')));
    await assertFails(getDoc(doc(dbAs(ALICE), 'contacts/bob-contact')));
  });

  it('lista contatos de uma conexão filtrando por tenantId', async () => {
    const db = dbAs(ALICE);
    const ownQuery = query(
      collection(db, 'contacts'),
      where('tenantId', '==', ALICE),
      where('connectionId', '==', 'alice-conn'),
    );
    await assertSucceeds(getDocs(ownQuery));
    // Sem o filtro de tenant, mesmo apontando para a própria conexão, a query é negada.
    await assertFails(
      getDocs(query(collection(db, 'contacts'), where('connectionId', '==', 'alice-conn'))),
    );
  });

  it('cria contato na própria conexão', async () => {
    await assertSucceeds(setDoc(doc(dbAs(ALICE), 'contacts/new'), newContact(ALICE, 'alice-conn')));
  });

  it('não cria contato em conexão de outro cliente ou inexistente', async () => {
    const db = dbAs(ALICE);
    await assertFails(setDoc(doc(db, 'contacts/a'), newContact(ALICE, 'bob-conn')));
    await assertFails(setDoc(doc(db, 'contacts/b'), newContact(ALICE, 'missing-conn')));
  });

  it('rejeita telefone fora do padrão E.164', async () => {
    const db = dbAs(ALICE);
    await assertFails(
      setDoc(doc(db, 'contacts/a'), newContact(ALICE, 'alice-conn', { phone: '11999998888' })),
    );
    await assertFails(
      setDoc(doc(db, 'contacts/b'), newContact(ALICE, 'alice-conn', { phone: '+55 11 9999' })),
    );
  });

  it('dono edita nome e telefone', async () => {
    await assertSucceeds(
      updateDoc(doc(dbAs(ALICE), 'contacts/alice-contact'), {
        name: 'Maria Silva',
        phone: '+5511911112222',
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it('não move contato para outra conexão nem outro tenant', async () => {
    const db = dbAs(ALICE);
    await assertFails(
      updateDoc(doc(db, 'contacts/alice-contact'), {
        connectionId: 'bob-conn',
        updatedAt: serverTimestamp(),
      }),
    );
    await assertFails(
      updateDoc(doc(db, 'contacts/alice-contact'), { tenantId: BOB, updatedAt: serverTimestamp() }),
    );
  });

  it('não edita nem exclui contato de outro cliente', async () => {
    const db = dbAs(ALICE);
    await assertFails(
      updateDoc(doc(db, 'contacts/bob-contact'), { name: 'hack', updatedAt: serverTimestamp() }),
    );
    await assertFails(deleteDoc(doc(db, 'contacts/bob-contact')));
  });
});

describe('messages', () => {
  it('dono lê as próprias mensagens; outro cliente não', async () => {
    await assertSucceeds(getDoc(doc(dbAs(ALICE), 'messages/alice-sent')));
    await assertFails(getDoc(doc(dbAs(ALICE), 'messages/bob-scheduled')));
  });

  it('lista mensagens filtradas por status com tenantId', async () => {
    const db = dbAs(ALICE);
    const ownQuery = query(
      collection(db, 'messages'),
      where('tenantId', '==', ALICE),
      where('connectionId', '==', 'alice-conn'),
      where('status', '==', 'scheduled'),
    );
    await assertSucceeds(getDocs(ownQuery));
    await assertFails(
      getDocs(query(collection(db, 'messages'), where('status', '==', 'scheduled'))),
    );
  });

  it('envia mensagem imediatamente (sentAt do servidor)', async () => {
    await assertSucceeds(setDoc(doc(dbAs(ALICE), 'messages/new'), newMessage(ALICE, 'alice-conn')));
  });

  it('não aceita sentAt definido pelo cliente', async () => {
    await assertFails(
      setDoc(
        doc(dbAs(ALICE), 'messages/new'),
        newMessage(ALICE, 'alice-conn', { sentAt: Timestamp.now() }),
      ),
    );
  });

  it('agenda mensagem para o futuro', async () => {
    await assertSucceeds(
      setDoc(
        doc(dbAs(ALICE), 'messages/new'),
        newMessage(ALICE, 'alice-conn', scheduledOverrides(1)),
      ),
    );
  });

  it('não agenda no passado nem para mais de 1 ano', async () => {
    const db = dbAs(ALICE);
    await assertFails(
      setDoc(doc(db, 'messages/a'), newMessage(ALICE, 'alice-conn', scheduledOverrides(-1))),
    );
    await assertFails(
      setDoc(doc(db, 'messages/b'), newMessage(ALICE, 'alice-conn', scheduledOverrides(24 * 400))),
    );
  });

  it('não cria mensagem agendada já marcada como enviada', async () => {
    await assertFails(
      setDoc(
        doc(dbAs(ALICE), 'messages/new'),
        newMessage(ALICE, 'alice-conn', { ...scheduledOverrides(1), status: 'sent' }),
      ),
    );
  });

  it('não cria mensagem em conexão de outro cliente ou em nome de outro cliente', async () => {
    const db = dbAs(ALICE);
    await assertFails(setDoc(doc(db, 'messages/a'), newMessage(ALICE, 'bob-conn')));
    await assertFails(setDoc(doc(db, 'messages/b'), newMessage(BOB, 'bob-conn')));
  });

  it('exige destinatários consistentes e texto válido', async () => {
    const db = dbAs(ALICE);
    await assertFails(
      setDoc(
        doc(db, 'messages/a'),
        newMessage(ALICE, 'alice-conn', { recipientIds: [], recipients: [] }),
      ),
    );
    await assertFails(
      setDoc(doc(db, 'messages/b'), newMessage(ALICE, 'alice-conn', { recipientIds: ['a', 'b'] })),
    );
    await assertFails(setDoc(doc(db, 'messages/c'), newMessage(ALICE, 'alice-conn', { body: '' })));
    await assertFails(
      setDoc(doc(db, 'messages/d'), newMessage(ALICE, 'alice-conn', { body: 'x'.repeat(1001) })),
    );
  });

  it('edita o conteúdo e reagenda uma mensagem agendada', async () => {
    await assertSucceeds(
      updateDoc(doc(dbAs(ALICE), 'messages/alice-scheduled'), {
        body: 'Texto novo',
        scheduledAt: inHours(5),
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it('envia agora uma mensagem que estava agendada', async () => {
    await assertSucceeds(
      updateDoc(doc(dbAs(ALICE), 'messages/alice-scheduled'), {
        status: 'sent',
        scheduledAt: null,
        sentAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it('não edita mensagem já enviada', async () => {
    await assertFails(
      updateDoc(doc(dbAs(ALICE), 'messages/alice-sent'), {
        body: 'Alterado',
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it('não move mensagem para outra conexão ou tenant', async () => {
    const db = dbAs(ALICE);
    await assertFails(
      updateDoc(doc(db, 'messages/alice-scheduled'), {
        connectionId: 'bob-conn',
        updatedAt: serverTimestamp(),
      }),
    );
    await assertFails(
      updateDoc(doc(db, 'messages/alice-scheduled'), {
        tenantId: BOB,
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it('não edita nem exclui mensagem de outro cliente', async () => {
    const db = dbAs(ALICE);
    await assertFails(
      updateDoc(doc(db, 'messages/bob-scheduled'), { body: 'hack', updatedAt: serverTimestamp() }),
    );
    await assertFails(deleteDoc(doc(db, 'messages/bob-scheduled')));
  });

  it('dono exclui mensagens enviadas e agendadas', async () => {
    const db = dbAs(ALICE);
    await assertSucceeds(deleteDoc(doc(db, 'messages/alice-sent')));
    await assertSucceeds(deleteDoc(doc(db, 'messages/alice-scheduled')));
  });
});
