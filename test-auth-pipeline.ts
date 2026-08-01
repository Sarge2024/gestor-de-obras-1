import { Request, Response } from 'express';
import fetch from 'node-fetch';

async function runTest() {
  console.log("Iniciando pipeline de teste da autenticação OAuth...");
  try {
    const res = await fetch("http://localhost:8500/api/auth/oauth-login", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        provider: 'google',
        uid: 'test_pipeline_uid',
        email: 'pipeline@test.com',
        displayName: 'Test Pipeline',
        photoURL: 'https://example.com/photo.png'
      })
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", JSON.stringify(data, null, 2));
    
    if (res.status === 200 && data.success) {
      console.log("✅ Pipeline: Autenticação OAuth operando corretamente!");
    } else {
      console.error("❌ Pipeline: Falha na autenticação OAuth.");
      process.exit(1);
    }
  } catch (err: any) {
    console.error("❌ Pipeline Erro:", err.message);
    process.exit(1);
  }
}
runTest();
