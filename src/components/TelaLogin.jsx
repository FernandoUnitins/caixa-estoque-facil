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

      // Busca o usuário pelo e-mail ou username
      const { data: userRecord, error: dbError } = await supabase
        .from('usuarios')
        .select('email, ativo')
        .or(`username.eq.${inputLimpo},email.eq.${inputLimpo}`)
        .maybeSingle();

      // Se não encontrar o usuário, exibe a mensagem de erro genérica (Segurança)
      if (dbError || !userRecord) {
        mostrarToast('Usuário ou senha incorreta.', 'erro');
        setLoading(false);
        return;
      }

      // Trava de segurança para contas inativas
      if (userRecord.ativo === false) {
        mostrarToast('Sua conta foi desativada pelo administrador.', 'erro');
        setLoading(false);
        return;
      }

      // Tenta fazer o login real no Supabase Auth
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: userRecord.email,
        password: senha
      });

      // Se a senha estiver errada, exibe a MESMA mensagem de erro genérica
      if (authError) {
        mostrarToast('Usuário ou senha incorreta.', 'erro');
        setLoading(false);
      } else {
        mostrarToast('Bem-vindo ao sistema!', 'sucesso');
      }
      
    } catch (err) {
      console.error('Erro no login:', err);
      mostrarToast('Erro de comunicação com o servidor. Tente novamente.', 'erro');
      setLoading(false);
    }
  };

  const handleRecuperarSenha = async (e) => {
    e.preventDefault();
    
    if (!emailRecuperacao || !emailRecuperacao.includes('@')) {
      mostrarToast('Por favor, informe um e-mail válido.', 'erro');
      return;
    }
    
    setLoading(true);
    
    try {
      // Dispara o e-mail oficial de recuperação do Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(emailRecuperacao, {
        redirectTo: window.location.origin, 
      });

      if (error) {
        console.error('Erro na recuperação:', error);
        mostrarToast('Erro ao enviar link. Verifique se o e-mail está correto.', 'erro');
      } else {
        mostrarToast('Link de recuperação enviado para o seu e-mail!', 'sucesso');
        setModoRecuperacao(false);
        setEmailRecuperacao(''); 
      }
    } catch (err) {
      console.error('Erro ao recuperar senha:', err);
      mostrarToast('Erro ao processar solicitação. Tente novamente.', 'erro');
    } finally {
      setLoading(false);
    }
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
            disabled={loading}
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
          <Label htmlFor="usuario">Nome de usuário ou E-mail</Label>
          <input
            id="usuario"
            type="text"
            placeholder="Ex: caixa01"
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
            placeholder="Sua senha"
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
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#4f46e5', 
            marginTop: '15px', 
            cursor: 'pointer', 
            fontWeight: 'bold', 
            fontSize: '0.85rem' 
          }}
          disabled={loading}
        >
          ESQUECI MINHA SENHA
        </button>
      </center>
  
    </div>
  );
}