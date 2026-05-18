import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function TelaLogin({ mostrarToast }) {
  const [usernameInput, setUsernameInput] = useState('');
  const [senha, setSenha] = useState('');
  
  const [emailRecuperacao, setEmailRecuperacao] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [modoRecuperacao, setModoRecuperacao] = useState(false);
  
  // Novos estados para a redefinição de senha
  const [modoNovaSenha, setModoNovaSenha] = useState(false);
  const [novaSenha, setNovaSenha] = useState('');

  // Verifica se o usuário chegou nesta tela através de um link de recuperação
  useEffect(() => {
    // Escuta o evento oficial do Supabase de recuperação de senha
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setModoNovaSenha(true);
      }
    });

    // Fallback: Verifica diretamente na URL se existe o parâmetro de recuperação
    if (window.location.hash.includes('type=recovery')) {
      setModoNovaSenha(true);
    }

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

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
        mostrarToast('Sua conta foi desativada.', 'erro');
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
        // Redireciona de volta para a raiz do seu site
        redirectTo: window.location.origin, 
      });

      if (error) {
        console.error('Erro na recuperação:', error);
        mostrarToast('Erro ao enviar link. Verifique se o e-mail está correto.', 'erro');
      } else {
        mostrarToast('Link de recuperação enviado para o e-mail informado!', 'sucesso');
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

  // Nova função para salvar a nova senha no banco do Supabase
  const handleAtualizarSenha = async (e) => {
    e.preventDefault();
    if (novaSenha.length < 6) {
      mostrarToast('A nova senha deve ter pelo menos 6 caracteres.', 'erro');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: novaSenha });

      if (error) {
        console.error('Erro ao atualizar senha:', error);
        mostrarToast('Erro ao atualizar senha. O link pode ter expirado.', 'erro');
      } else {
        mostrarToast('Senha atualizada com sucesso! Você já pode entrar.', 'sucesso');
        setModoNovaSenha(false);
        setNovaSenha('');
        setSenha(''); // Limpa a senha do form de login
        // Limpa a URL para tirar o token gigante
        window.history.replaceState(null, '', window.location.pathname);
      }
    } catch (err) {
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

  // ==========================================
  // TELA 3: CRIAR NOVA SENHA (VINDO DO LINK)
  // ==========================================
  if (modoNovaSenha) {
    return (
      <div className="tela-login">
        <header>
          <center>
            <h1 style={{ color: '#10b981' }}>Nova Senha</h1>
            <p>Crie uma nova senha de acesso para sua conta</p>
          </center>
        </header>
        <form onSubmit={handleAtualizarSenha} className="form-padrao">
          <div style={{ width: '100%' }}>
            <Label htmlFor="nova-senha">Digite a Nova Senha</Label>
            <input 
              id="nova-senha"
              type="password" 
              placeholder="No mínimo 6 caracteres" 
              value={novaSenha} 
              onChange={(e) => setNovaSenha(e.target.value)} 
              className="input-padrao" 
              required 
              minLength={6}
            />
          </div>
          <button type="submit" className="btn-entrada" style={{ backgroundColor: '#10b981' }} disabled={loading}>
            {loading ? 'Salvando...' : 'SALVAR E ENTRAR'}
          </button>
        </form>
      </div>
    );
  }

  // ==========================================
  // TELA 2: SOLICITAR RECUPERAÇÃO DE SENHA
  // ==========================================
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
              placeholder="" 
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

  // ==========================================
  // TELA 1: LOGIN PADRÃO
  // ==========================================
  return (
    <div className="tela-login">
      <header>
        <center>
          <h1>Mini Mercado Feitosa</h1>
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