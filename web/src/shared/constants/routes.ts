/** Caminhos do app em um só lugar (rotas, links e redirecionamentos). */
export const ROUTES = {
  login: '/login',
  signup: '/signup',
  connections: '/connections',
  connection: (connectionId: string) => `/connections/${connectionId}`,
  contacts: (connectionId: string) => `/connections/${connectionId}/contacts`,
  broadcast: (connectionId: string) => `/connections/${connectionId}/broadcast`,
} as const;
