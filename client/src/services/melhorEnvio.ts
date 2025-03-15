// src/services/melhorEnvio.ts
import api from './api';

/**
 * Consulta o status da integração do Melhor Envio para um determinado ownerId (por exemplo, catalogId).
 * Retorna um objeto com { activated: boolean }
 */
export async function getMelhorEnvioStatus(ownerId: string) {
  const response = await api.get('/melhorenvio/status', {
    params: { ownerId },
  });
  return response.data;
}

/**
 * Inicia o fluxo de autorização do Melhor Envio.
 * O backend retorna uma mensagem com a URL para autorizar.
 */
export async function authorizeMelhorEnvio(ownerId: string) {
  const response = await api.get('/melhorenvio/authorize', {
    params: { ownerId },
  });
  return response.data;
}

/**
 * Desativa a integração do Melhor Envio, excluindo o token armazenado.
 */
export async function deactivateMelhorEnvio(ownerId: string) {
  const response = await api.delete('/melhorenvio', {
    data: { ownerId },
  });
  return response.data;
}
