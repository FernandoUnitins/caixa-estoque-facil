import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function TelaLogin({ mostrarToast }) {
  const [usernameInput, setUsernameInput] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Busca o e-mail vinculado ao nome de usuário (Case Insensitive)
      const { data: userRecord, error: dbError } = await supabase
        .from('usuarios')
        .select('email')
        .eq('username', usernameInput.toLowerCase()) // Compara sempre em minúsculo
        .single();

      if (dbError || !userRecord) {
        mostrarToast('Usuário não encontrado.', 'erro');
        setLoading(false);
        return;
      }

      // 2. Agora faz o login real usando o e-mail encontrado
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: userRecord.email,
        password: senha
      });

      if (authError) {
        mostrarToast('Senha incorreta.', 'erro');
      } else {
        mostrarToast('Bem-vindo ao sistema!', 'sucesso');
      }
    } catch (err) {
      mostrarToast('Erro de conexão.', 'erro');
    } finally {
      setLoading(false);
    }
  };

  const handleEsqueciSenha = () => {
    mostrarToast('Procure o administrador Fredson para resetar sua senha.', 'erro');
  };

  return (
    <div className="tela-login">
      <header>
        <h1>Caixa & Estoque Fácil</h1>
        <h2>Acesso ao Sistema</h2>
        <p>Identifique-se para continuar</p>
      </header>

      <form onSubmit={handleLogin} className="form-padrao">
        <input
          type="text"
          placeholder="Nome de Usuário"
          value={usernameInput}
          onChange={(e) => setUsernameInput(e.target.value)}
          className="input-padrao"
          required
        />
        <input
          type="password"
          placeholder="Sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="input-padrao"
          required
        />
        <button type="submit" className="btn-entrada" disabled={loading}>
          {loading ? 'Aguarde...' : 'ENTRAR'}
        </button>
      </form>
    </div>
  );
}