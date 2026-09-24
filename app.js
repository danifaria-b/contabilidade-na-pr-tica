// ============================================================
// app.js — versão simplificada (aluno sem login, admin com login)
// Inclua no HTML, ANTES deste arquivo:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
// ============================================================

const SUPABASE_URL = "COLE_AQUI_A_URL_DO_SEU_PROJETO";
const SUPABASE_ANON_KEY = "COLE_AQUI_A_ANON_KEY";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---------- ALUNO (sem conta, sem senha) ----------

// Chame isso quando o aluno confirmar um lançamento no simulador.
// `nomeAluno` é o texto que ele digitou no campo de nome.
async function registrarLancamento(nomeAluno, exercicio, conteudo) {
  const nome = (nomeAluno || "").trim();
  if (!nome) throw new Error("Digite seu nome completo antes de lançar.");

  const { data, error } = await supabase
    .from("lancamentos")
    .insert({ aluno_nome: nome, exercicio, conteudo })
    .select()
    .single();
  if (error) throw error;

  await supabase.from("activity_log").insert({
    aluno_nome: nome,
    acao: "lancamento_criado",
    detalhes: { exercicio, lancamento_id: data.id }
  });

  return data;
}

// ---------- ADMIN (login normal) ----------

async function loginAdmin(email, senha) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error) throw error;
  return data;
}

async function logoutAdmin() {
  await supabase.auth.signOut();
}

async function usuarioAtual() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// true se o usuário logado está na tabela `admins`
async function souAdmin() {
  const user = await usuarioAtual();
  if (!user) return false;
  const { data, error } = await supabase
    .from("admins")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (error) return false;
  return !!data;
}
