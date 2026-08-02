import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Checking DB connection...");
  const { data, error } = await supabase.from('usuarios').select('email').limit(1);
  if (error) {
    console.error("Error fetching usuarios:", error);
    if (error.message.includes('relation "usuarios" does not exist')) {
      console.log("TABLE DOES NOT EXIST. RUNNING MIGRATIONS IS REQUIRED.");
    }
    return;
  }
  
  console.log("Table exists! Upserting admin user...");
  const { error: upsertErr } = await supabase.from('usuarios').upsert({
    email: 'sagacitas.sistemas@gmail.com',
    nome: 'Admin Master',
    perfil: 'ADMIN',
    status: 'ATIVO'
  }, { onConflict: 'email' });
  
  if (upsertErr) {
    console.error("Error upserting admin:", upsertErr);
  } else {
    console.log("Admin user provisioned successfully!");
  }
}
run();
