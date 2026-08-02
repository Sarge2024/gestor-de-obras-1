import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: existing } = await supabase.from('usuarios').select('*').eq('email', 'sagacitas.sistemas@gmail.com').single();
  if (existing) {
    console.log("Admin já existe! Atualizando status...");
    await supabase.from('usuarios').update({ perfil: 'ADMIN', status: 'ATIVO' }).eq('email', 'sagacitas.sistemas@gmail.com');
    console.log("Pronto!");
    return;
  }

  const { error } = await supabase.from('usuarios').insert({
    email: 'sagacitas.sistemas@gmail.com',
    nome: 'Admin Master',
    perfil: 'ADMIN',
    status: 'ATIVO'
  });
  
  if (error) {
    console.error("Erro:", error);
  } else {
    console.log("Admin user provisioned successfully!");
  }
}
run();
