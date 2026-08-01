import handler from './server';
import http from 'http';
import fetch from 'node-fetch';

async function run() {
  console.log("Iniciando...");
  const server = http.createServer(async (req, res) => {
    await handler(req, res);
  });
  
  server.listen(9876, async () => {
    console.log("Servidor de teste ouvindo na porta 9876...");
    try {
      console.log("1. Testando login desconhecido...");
      const res1 = await fetch("http://localhost:9876/api/auth/oauth-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "google", email: "unknown@test.com", displayName: "Unknown" })
      });
      console.log("Status Desconhecido:", res1.status);
      
      console.log("2. Testando admin...");
      const res2 = await fetch("http://localhost:9876/api/auth/oauth-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "google", email: "sagacitas.sistemas@gmail.com", displayName: "Admin" })
      });
      console.log("Status Admin:", res2.status);
      const data2 = await res2.json();
      if (res2.ok && data2.session.customClaims.perfil === "ADMIN") {
        console.log("✅ Admin Logado com Sucesso!");
      }

      console.log("3. Testando RLS no endpoint POST /api/empresas com Admin");
      const idToken = data2.session.idToken;
      const res3 = await fetch("http://localhost:9876/api/empresas", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${idToken}` },
        body: JSON.stringify({
          id: "emp-test",
          nome: "Empresa Teste",
          cnpj_cpf: "12345678900",
          tipo: "FORNECEDOR"
        })
      });
      console.log("Status POST Empresas:", res3.status);
      const data3 = await res3.json();
      console.log("Resposta:", data3);

      process.exit(0);
    } catch(err) {
      console.error("❌ Request Failed:", err);
      process.exit(1);
    }
  });
}
run();
