/** Dados do usuário autenticado usados pelo app. O `uid` é o tenantId do cliente. */
export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
};
