export class DomainError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}
export const unauthenticated = () =>
  new DomainError(401, "UNAUTHENTICATED", "Entre na sua conta para continuar.");
export const unavailable = () =>
  new DomainError(404, "NOT_FOUND", "Recurso não encontrado.");
