import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function TelaLogin({ mostrarToast }) {
  const [usernameInput, setUsernameInput] = useState('');
  const [senha, setSenha] = useState('');
  
  const [emailRecuperacao, setEmailRecuperacao] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [modoRecuperacao, setModoRecuperacao] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Limpa o input: remove espaços em branco, joga pra minúsculo e tira o "@" se a pessoa digitou
      const inputLimpo = usernameInput.replace('@', '').trim().toLowerCase();

      // Busca super inteligente: aceita tanto o E-MAIL quanto o USERNAME
      const { data: userRecord, error: dbError } = await supabase
        .from('usuarios')
        .select('email, ativo')
        .or(`username.eq.${inputLimpo},email.eq.${inputLimpo}`)
        .maybeSingle();

      if (dbError || !userRecord) {
        mostrarToast('Usuário ou E-mail não encontrado no sistema.', 'erro');
        setLoading(false);
        return;
      }

      if (userRecord.ativo === false) {
        mostrarToast('Sua conta foi desativada pelo administrador.', 'erro');
        setLoading(false);
        return;
      }

      // Login real no Supabase Auth usando o e-mail real vinculado
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: userRecord.email,
        password: senha
      });

      if (authError) {
         if (authError.message.includes('Invalid login credentials')) {
            mostrarToast('Senha incorreta! Tente novamente.', 'erro');
         } else {
            mostrarToast(`Erro: ${authError.message}`, 'erro');
         }
      } else {
         mostrarToast('Bem-vindo!', 'sucesso');
      }
      
    } catch (err) {
      mostrarToast('Erro de comunicação com o servidor.', 'erro');
    } finally {
      setLoading(false);
    }
  };

  const handleRecuperarSenha = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(emailRecuperacao, {
      redirectTo: window.location.origin, 
    });

    if (error) {
      mostrarToast('Erro ao enviar e-mail. Verifique se o endereço está correto.', 'erro');
    } else {
      mostrarToast('Link de recuperação enviado para o seu e-mail!', 'sucesso');
      setModoRecuperacao(false);
      setEmailRecuperacao(''); 
    }
    setLoading(false);
  };

  if (modoRecuperacao) {
    return (
      <div className="tela-login">
        <header>
          <h1>Recuperar Senha</h1>
          <p>Digite seu e-mail cadastrado abaixo</p>
        </header>
        <form onSubmit={handleRecuperarSenha} className="form-padrao">
          <input 
            type="email" 
            placeholder="Seu e-mail de acesso" 
            value={emailRecuperacao} 
            onChange={(e) => setEmailRecuperacao(e.target.value)} 
            className="input-padrao" 
            required 
          />
          <button type="submit" className="btn-entrada" disabled={loading}>
            {loading ? 'Enviando...' : 'ENVIAR LINK'}
          </button>
          
          <button 
            type="button" 
            onClick={() => {
              setModoRecuperacao(false);
              setEmailRecuperacao(''); 
            }} 
            className="btn-secundario"
          >
            VOLTAR AO LOGIN
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="tela-login">
      <header>
        <h1>Caixa & Estoque Fácil</h1>
        <h2>Acesso ao Sistema</h2>
      </header>

      <form onSubmit={handleLogin} className="form-padrao">
        <input
          type="text"
          placeholder="E-mail ou Login (Ex: caixa01)"
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
          {loading ? 'Verificando...' : 'ENTRAR'}
        </button>
      </form>

      <button 
        onClick={() => setModoRecuperacao(true)} 
        style={{ background: 'none', border: 'none', color: '#4f46e5', marginTop: '15px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
      >
        ESQUECI MINHA SENHA
      </button>
    </div>
  );
}