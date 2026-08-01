import { Response, NextFunction } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { AuthenticatedRequest } from '../types/middleware.types';

export async function verifyFirebaseJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autorização ausente ou malformado.' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  // Em ambiente de desenvolvimento local, permitimos bypass para tokens mockados
  if (process.env.NODE_ENV !== 'production' && idToken.startsWith('mock_')) {
    const isFornecedor = req.headers['x-mock-fornecedor'] === 'true' || req.query.perfil === 'FORNECEDOR';
    req.decodedToken = {
      uid: 'usr_demo_2026',
      email: isFornecedor ? 'fornecedor@logistica.com.br' : 'financeiro@logisticsglobal.com.br',
      contrato_id: (req.query.contrato_id as string) || (req.body.contrato_id as string) || 'CTR-2026-SYS',
      empresa_id: isFornecedor ? 'SUP-4012-LOGISTICA' : 'SUP-9823-STORAGE',
      entidade_id: isFornecedor ? 'SUP-4012-LOGISTICA' : 'SUP-9823-STORAGE',
      perfil: isFornecedor ? 'FORNECEDOR' : 'FINANCEIRO',
      mfa_verified: true
    };
    return next();
  }

  try {
    // verifyIdToken realiza a validação stateless em memória com chaves públicas (JWKS)
    // cacheando as chaves internamente e evitando round-trips por requisição.
    const decodedToken = await getAuth().verifyIdToken(idToken);
    
    req.decodedToken = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      contrato_id: (decodedToken.contrato_id as string) || '',
      empresa_id: (decodedToken.empresa_id as string) || '',
      entidade_id: (decodedToken.entidade_id as string) || (decodedToken.empresa_id as string) || '',
      perfil: (decodedToken.perfil as any) || 'FORNECEDOR',
      mfa_verified: !!decodedToken.mfa_verified
    };
    
    next();
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error(`[middleware.verifyFirebaseJWT] Falha ao decodificar/validar token: ${errMsg}`);
    return res.status(401).json({ error: `Acesso não autorizado: ${errMsg}` });
  }
}
