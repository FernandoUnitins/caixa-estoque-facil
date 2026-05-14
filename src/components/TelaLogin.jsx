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
      const inputLimpo = usernameInput.replace('@', '').trim().toLowerCase();

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
      mostrarToast('Erro ao enviar e-mail. Verifique o endereço está correto.', 'erro');
    } else {
      mostrarToast('Link de recuperação enviado para o seu e-mail!', 'sucesso');
      setModoRecuperacao(false);
      setEmailRecuperacao(''); 
    }
    setLoading(false);
  };

  // Componente de Label interno para padronização
  const Label = ({ htmlFor, children }) => (
    <label 
      htmlFor={htmlFor} 
      style={{ 
        fontSize: '0.85rem', 
        fontWeight: '700', 
        color: '#4b5563', 
        marginBottom: '5px', 
        display: 'block',
        textAlign: 'left'
      }}
    >
      {children}
    </label>
  );

  if (modoRecuperacao) {
    return (
      <div className="tela-login">
        <header>
          <center>
            <h1>Recuperar Senha</h1>
            <p>Informe seu e-mail para receber o link</p>
          </center>
        </header>
        <form onSubmit={handleRecuperarSenha} className="form-padrao">
          <div style={{ width: '100%' }}>
            <Label htmlFor="email-recuperacao">E-mail cadastrado</Label>
            <input 
              id="email-recuperacao"
              type="email" 
              placeholder="exemplo@email.com" 
              value={emailRecuperacao} 
              onChange={(e) => setEmailRecuperacao(e.target.value)} 
              className="input-padrao" 
              required 
            />
          </div>
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
        <center>

          <h1>Caixa & Estoque Fácil</h1>
          <h2>Acesso ao Sistema</h2>
        </center>
      </header>

      <form onSubmit={handleLogin} className="form-padrao">
        <div style={{ width: '100%' }}>
          <Label htmlFor="usuario">Nome de usuário</Label>
          <input
            id="usuario"
            type="text"
            placeholder=""
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            className="input-padrao"
            required
          />
        </div>

        <div style={{ width: '100%' }}>
          <Label htmlFor="senha">Senha de acesso</Label>
          <input
            id="senha"
            type="password"
            placeholder=""
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="input-padrao"
            required
          />
        </div>

        <button type="submit" className="btn-entrada" disabled={loading}>
          {loading ? 'Verificando...' : 'ENTRAR'}
        </button>
      </form>

        <center>
    <button 
        onClick={() => setModoRecuperacao(true)} 
        style={{ background: 'none', border: 'none', color: '#4f46e5', marginTop: '15px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
      >
        ESQUECI MINHA SENHA
      </button>

        </center>
  
    </div>
  );
}