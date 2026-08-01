import dotenv from "dotenv";
dotenv.config({ override: true });
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

async function check() {
  console.log("\n=== VERIFICANDO CONEXÕES ===");
  
  // 1. Supabase Check
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  
  console.log(`\n[Supabase] URL: ${supabaseUrl}`);
  console.log(`[Supabase] Key: ${supabaseKey ? supabaseKey.substring(0, 20) + "..." : "Não configurada"}`);
  
  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Erro: SUPABASE_URL ou chaves de acesso ausentes no arquivo .env.");
  } else {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      // Consultando tabela de empresas contratantes para verificar acesso
      const { data, error } = await supabase.from("empresa_contratante").select("*").limit(1);
      if (error) {
        console.error(`❌ Erro ao consultar Supabase: ${error.message}`);
      } else {
        console.log("✅ Conexão com Supabase local bem-sucedida!");
        console.log("Dados lidos do Supabase:", data);
      }
    } catch (err: any) {
      console.error(`❌ Falha crítica ao conectar no Supabase: ${err.message}`);
    }
  }

  // 2. Firebase Check
  console.log(`\n[Firebase] Lendo configurações locais...`);
  let configData: any = {};
  const configFile = path.join(process.cwd(), "firebase-applet-config.json");
  
  if (fs.existsSync(configFile)) {
    try {
      configData = JSON.parse(fs.readFileSync(configFile, "utf-8"));
      console.log(`✅ Arquivo firebase-applet-config.json encontrado.`);
      console.log(`[Firebase] Project ID: ${configData.projectId}`);
      console.log(`[Firebase] App ID: ${configData.appId}`);
      console.log(`[Firebase] Auth Domain: ${configData.authDomain}`);
    } catch (e: any) {
      console.error(`❌ Erro ao ler json de configurações do Firebase: ${e.message}`);
    }
  } else {
    console.warn(`⚠️ Aviso: Arquivo firebase-applet-config.json não encontrado.`);
  }
  
  // Testar conectividade HTTP com o endpoint de chaves públicas (JWKS) do Firebase Auth
  const jwksUrl = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";
  console.log(`[Firebase] Testando conectividade com chaves públicas (JWKS)...`);
  try {
    const res = await fetch(jwksUrl);
    if (res.ok) {
      const keys = await res.json();
      console.log(`✅ Conexão com chaves públicas do Firebase Auth ativa! (${Object.keys(keys).length} chaves públicas carregadas)`);
    } else {
      console.error(`❌ Falha na resposta HTTP do Firebase JWKS: Status ${res.status}`);
    }
  } catch (err: any) {
    console.error(`❌ Falha ao tentar acessar chaves públicas do Firebase: ${err.message}`);
  }
}

check();
