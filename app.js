const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

let filmes = [];
let usuarios = [];
let favoritos = [];

let proximoIdFilme = 1;
let proximoIdUsuario = 1;
let proximoIdFavorito = 1;

// ====================== FUNÇÕES AUXILIARES ======================

function filmeJaExiste(titulo) {
  return filmes.some(f => f.titulo.toLowerCase() === titulo.toLowerCase().trim());
}

function buscarFilmePorId(id) {
  return filmes.find(f => f.id === parseInt(id));
}

function buscarUsuarioPorId(id) {
  return usuarios.find(u => u.id === parseInt(id));
}

// ====================== ROTAS ======================

app.get('/', (req, res) => {
  res.json({ 
    mensagem: "CineStream API rodando",
    filmes: filmes.length,
    usuarios: usuarios.length,
    favoritos: favoritos.length
  });
});

// FILMES
app.get('/filmes', (req, res) => {
  res.json(filmes);
});

app.post('/filmes', (req, res) => {
  const { titulo, genero, ano_lancamento } = req.body;

  if (!titulo || typeof titulo !== 'string' || titulo.trim() === '') {
    return res.status(400).json({ erro: "O campo 'titulo' é obrigatório" });
  }
  if (!genero || typeof genero !== 'string' || genero.trim() === '') {
    return res.status(400).json({ erro: "O campo 'genero' é obrigatório" });
  }
  if (ano_lancamento === undefined || isNaN(parseInt(ano_lancamento))) {
    return res.status(400).json({ erro: "O campo 'ano_lancamento' deve ser um número válido" });
  }

  const tituloLimpo = titulo.trim();

  if (filmeJaExiste(tituloLimpo)) {
    return res.status(409).json({ erro: `Já existe um filme com o título "${tituloLimpo}"` });
  }

  const novoFilme = {
    id: proximoIdFilme++,
    titulo: tituloLimpo,
    genero: genero.trim(),
    ano_lancamento: parseInt(ano_lancamento)
  };

  filmes.push(novoFilme);
  res.status(201).json({ mensagem: "Filme cadastrado com sucesso", filme: novoFilme });
});

app.delete('/filmes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = filmes.findIndex(f => f.id === id);

  if (index === -1) {
    return res.status(404).json({ erro: "Filme nao encontrado" });
  }

  const filmeRemovido = filmes.splice(index, 1)[0];
  favoritos = favoritos.filter(f => f.id_filme !== id);

  res.json({ mensagem: "Filme removido com sucesso", filme: filmeRemovido });
});

// USUÁRIOS
app.get('/usuarios', (req, res) => {
  res.json(usuarios);
});

app.post('/usuarios', (req, res) => {
  let { nome, email, plano = "Basico" } = req.body;

  if (!nome || typeof nome !== 'string' || nome.trim() === '') {
    return res.status(400).json({ erro: "O campo 'nome' é obrigatório" });
  }
  if (!email || typeof email !== 'string' || email.trim() === '') {
    return res.status(400).json({ erro: "O campo 'email' é obrigatório" });
  }

  const emailLimpo = email.toLowerCase().trim();

  if (usuarios.some(u => u.email === emailLimpo)) {
    return res.status(409).json({ erro: "Email ja cadastrado" });
  }

  const novoUsuario = {
    id: proximoIdUsuario++,
    nome: nome.trim(),
    email: emailLimpo,
    plano: plano.trim()
  };

  usuarios.push(novoUsuario);
  res.status(201).json({ mensagem: "Usuario cadastrado com sucesso", usuario: novoUsuario });
});

// FAVORITOS
app.post('/favoritos', (req, res) => {
  const { id_usuario, id_filme } = req.body;

  if (!id_usuario || !id_filme) {
    return res.status(400).json({ erro: "id_usuario e id_filme sao obrigatorios" });
  }

  const usuarioExiste = buscarUsuarioPorId(id_usuario);
  const filmeExiste = buscarFilmePorId(id_filme);

  if (!usuarioExiste) return res.status(404).json({ erro: "Usuario nao encontrado" });
  if (!filmeExiste) return res.status(404).json({ erro: "Filme nao encontrado" });

  const jaExiste = favoritos.some(f => 
    f.id_usuario === parseInt(id_usuario) && f.id_filme === parseInt(id_filme)
  );

  if (jaExiste) {
    return res.status(409).json({ erro: "Este filme ja esta nos favoritos deste usuario" });
  }

  const novoFavorito = {
    id: proximoIdFavorito++,
    id_usuario: parseInt(id_usuario),
    id_filme: parseInt(id_filme)
  };

  favoritos.push(novoFavorito);
  res.status(201).json({ mensagem: "Filme adicionado aos favoritos com sucesso", favorito: novoFavorito });
});

app.get('/favoritos', (req, res) => {
  res.json(favoritos);
});

app.get('/favoritos/usuario/:id_usuario', (req, res) => {
  const id = req.params.id_usuario;

  const usuario = buscarUsuarioPorId(id);
  if (!usuario) {
    return res.status(404).json({ erro: "Usuario nao encontrado" });
  }

  const favs = favoritos.filter(f => f.id_usuario === parseInt(id));
  res.json({
    usuario: { id: usuario.id, nome: usuario.nome },
    total: favs.length,
    favoritos: favs
  });
});

// ====================== INICIALIZAÇÃO ======================
app.listen(PORT, () => {
  console.log(`CineStream API rodando em http://localhost:${PORT}`);
});

// ====================== DADOS INICIAIS ======================
filmes = [
  { id: 1, titulo: "Duna: Parte Dois", genero: "Ficcao Cientifica", ano_lancamento: 2024 },
  { id: 2, titulo: "Oppenheimer", genero: "Drama Historico", ano_lancamento: 2023 },
  { id: 3, titulo: "Furiosa: A Mad Max Saga", genero: "Acao", ano_lancamento: 2024 },
  { id: 4, titulo: "Deadpool & Wolverine", genero: "Acao/Comedia", ano_lancamento: 2024 }
];
proximoIdFilme = 5;

usuarios = [
  { id: 1, nome: "Ana Silva", email: "ana.silva@email.com", plano: "Premium" },
  { id: 2, nome: "Joao Mendes", email: "joao.mendes@email.com", plano: "Basico" },
  { id: 3, nome: "Maria Oliveira", email: "maria.oliveira@email.com", plano: "Premium" },
  { id: 4, nome: "Pedro Santos", email: "pedro.santos@email.com", plano: "Basico" }
];
proximoIdUsuario = 5;