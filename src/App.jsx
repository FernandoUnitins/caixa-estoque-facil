import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './App.css';

// Import das Telas
import TelaLogin from './components/TelaLogin';
import TelaResumo from './components/TelaResumo';
import TelaEntrada from './components/TelaEntrada'; 
import TelaMenuCadastros from './components/TelaMenuCadastros';
import TelaProdutos from './components/TelaProdutos';
import TelaCategorias from './components/TelaCategorias';
import TelaFornecedores from './components/TelaFornecedores';
import TelaFormasPagamento from './components/TelaFormasPagamento';
import TelaPerfil from './components/TelaPerfil';
import TelaUsuarios from './components/TelaUsuarios';
import TelaRelatorios from './components/TelaRelatorios';
import { ChartColumnBig, House, FolderPen, FileText } from 'lucide-react'; 

// Ícones para a Navbar
const IconMenu = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;
const IconClose = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const IconCaixa = () => <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-dollar-sign-circle-icon lucide-dollar-sign-circle"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
const IconUser = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"></circle><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path></svg>;
const IconLock = () => <svg width="48" height="48" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const IconLogOut = ({ size = "18", color = "currentColor" }) => <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const IconSettings = ({ color = "currentColor" }) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;

// Novos Ícones de Tela Cheia
const IconMaximize = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>;
const IconMinimize = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>;

function App() {
  const [session, setSession] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [telaAtual, setTelaAtual] = useState('');
  const [subTela, setSubTela] = useState(null);
  const [toast, setToast] = useState({ visivel: false, mensagem: '', tipo: '' });
  
  const [recuperandoSenha, setRecuperandoSenha] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false); 

  const [sessaoCaixa, setSessaoCaixa] = useState(null);
  const [valorAbertura, setValorAbertura] = useState('');
  const [loadingCaixa, setLoadingCaixa] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [modalLogout, setModalLogout] = useState(false);

  const mostrarToast = (mensagem, tipo = 'sucesso') => {
    setToast({ visivel: true, mensagem, tipo });
    setTimeout(() => setToast({ visivel: false, mensagem: '', tipo: '' }), 3000);
  };

  useEffect(() => {
    let isRecovering = window.location.hash.includes('type=recovery');
    if (isRecovering) setRecuperandoSenha(true);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session && !isRecovering) carregarDadosIniciais(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      
      if (event === 'PASSWORD_RECOVERY') {
        setRecuperandoSenha(true);
        isRecovering = true;
      } 
      if (event === 'USER_UPDATED') {
        setRecuperandoSenha(false);
        isRecovering = false;
      }

      if (session && !isRecovering) {
        carregarDadosIniciais(session.user.id);
      } else if (!session) { 
        setPerfil(null); 
        setSessaoCaixa(null); 
        setTelaAtual(''); 
        setSubTela(null); 
      }
    });

    // Escuta eventos do navegador para saber se a tela cheia foi fechada pelo ESC
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const carregarDadosIniciais = async (userId) => {
    const { data: user } = await supabase.from('usuarios').select('*').eq('id', userId).single();
    if (user) {
      setPerfil(user);
      setTelaAtual(user.tipo === 'caixa' ? 'caixa' : 'resumo');
    }
    const { data: sessao } = await supabase.from('caixas_sessoes').select('*').eq('usuario_id', userId).eq('status', 'ABERTO').maybeSingle(); 
    setSessaoCaixa(sessao || null);
  };

  // Função para Alternar Tela Cheia
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Erro ao tentar entrar em tela cheia: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const abrirCaixa = async (e) => {
    e.preventDefault();
    setLoadingCaixa(true);
    const valorNum = parseFloat(valorAbertura.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    const { data, error } = await supabase.from('caixas_sessoes').insert([{
      usuario_id: session.user.id, valor_abertura: valorNum, status: 'ABERTO'
    }]).select();
    if (error) mostrarToast('Erro ao abrir o caixa.', 'erro');
    else { mostrarToast('Caixa aberto!', 'sucesso'); setSessaoCaixa(data[0]); setValorAbertura(''); }
    setLoadingCaixa(false);
  };

  const navegarPara = (tela) => {
    setTelaAtual(tela);
    setSubTela(null);
    setMenuAberto(false);
  };

  const confirmarESair = async () => {
    setModalLogout(false);
    await supabase.auth.signOut();
  };

  if (!session || recuperandoSenha) {
    return (
      <div className="app-container auth-container">
        {toast.visivel && <div className={`toast-container toast-${toast.tipo}`}>{toast.mensagem}</div>}
        <TelaLogin mostrarToast={mostrarToast} />
      </div>
    );
  }
  
  if (!perfil) return <div className="app-container" style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}}>Carregando...</div>;

  const mostrarMenuCadastros = true; 

  return (
    <div className="app-container">
      {toast.visivel && <div className={`toast-container toast-${toast.tipo}`}>{toast.mensagem}</div>}
      
      {modalLogout && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '16px', width: '90%', maxWidth: '350px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px', color: '#ef4444' }}>
              <IconLogOut size="48" color="#ef4444" />
            </div>
            <h3 style={{ margin: '0 0 10px 0', color: '#374151', fontSize: '1.2rem' }}>Sair do Sistema</h3>
            <p style={{ color: '#6b7280', marginBottom: '25px', fontSize: '0.95rem' }}>Tem certeza que deseja sair?</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-secundario" onClick={() => setModalLogout(false)} style={{ flex: 1, margin: 0 }}>CANCELAR</button>
              <button className="btn-saida" onClick={confirmarESair} style={{ flex: 1, margin: 0 }}>SAIR</button>
            </div>
          </div>
        </div>
      )}

      <header className="navbar">
        <div className="navbar-brand">
          Mini Mercado Feitosa
        </div>

        <nav className="nav-links-desktop">
          
          {perfil.tipo === 'adm' && (
            <button onClick={() => navegarPara('resumo')} className={telaAtual === 'resumo' ? 'ativo' : ''}><House /> Início</button>
          )}
          <button onClick={() => navegarPara('caixa')} className={telaAtual === 'caixa' ? 'ativo' : ''}><IconCaixa /> Caixa</button>
          
          {mostrarMenuCadastros && (
            <button onClick={() => navegarPara('cadastros')} className={telaAtual === 'cadastros' ? 'ativo' : ''}><IconSettings /> Configurações</button>
          )}
          
            <button onClick={() => navegarPara('relatorios')} className={telaAtual === 'relatorios' ? 'ativo' : ''}>
              <FileText size="20" />  Relatórios
            </button>
          

          <div className="navbar-user-info">
            {/* BOTÃO DE TELA CHEIA */}
            <button onClick={toggleFullScreen} title="Tela Cheia" style={{ background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px', color: '#4b5563', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}>
              {isFullscreen ? <IconMinimize /> : <IconMaximize />}
            </button>
            
            <span><IconUser /> {perfil.nome}</span>
            <button onClick={() => setModalLogout(true)}><IconLogOut /> Sair</button>
          </div>
        </nav>

        <button className="btn-hamburguer" onClick={() => setMenuAberto(!menuAberto)}>
          <span><IconUser /> {perfil.nome}</span>
          {menuAberto ? <IconClose /> : <IconMenu />}
        </button>

        {menuAberto && (
          <div className="menu-mobile-overlay">
            {/* BOTÃO TELA CHEIA MOBILE */}
            <button onClick={() => { setMenuAberto(false); toggleFullScreen(); }} style={{ color: '#4f46e5' }}>
               {isFullscreen ? <><IconMinimize /> Sair Tela Cheia</> : <><IconMaximize /> Tela Cheia</>}
            </button>

            {perfil.tipo === 'adm' && <button onClick={() => navegarPara('resumo')}><House /> Início</button>}
            <button onClick={() => navegarPara('caixa')}><IconCaixa /> Caixa</button>
            {mostrarMenuCadastros && <button onClick={() => navegarPara('cadastros')}><IconSettings /> Configurações</button>}
            
            <button onClick={() => navegarPara('relatorios')}>
              <FileText size="20" /> Relatórios
            </button>
           
            <button onClick={() => { setMenuAberto(false); setModalLogout(true); }} style={{color: '#ef4444', borderTop: '1px dashed #eee', marginTop: '10px'}}>
              <IconLogOut /> Sair
            </button>
          </div>
        )}
      </header>

      <div className="conteudo-dinamico">
        {telaAtual === 'resumo' && <TelaResumo sessaoCaixa={sessaoCaixa} setTelaAtual={setTelaAtual} />}
        
        {telaAtual === 'caixa' && !sessaoCaixa && (
          <div className="tela" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <IconLock />
            <h2 style={{ color: '#374151', marginTop: '15px', textAlign: 'center' }}>CAIXA FECHADO</h2>
            <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '20px', fontSize: '0.9rem' }}>Informe o fundo de troco para começar.</p>
            <form onSubmit={abrirCaixa} className="form-padrao" style={{ width: '100%', maxWidth: '350px' }}>
              <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f9fafb', border: '1px solid #d1d5db', borderRadius: '12px', overflow: 'hidden', marginBottom: '15px' }}>
                <span style={{ paddingLeft: '15px', paddingRight: '10px', color: '#6b7280', fontWeight: 'bold' }}>R$</span>
                <input type="text" placeholder="0,00" value={valorAbertura} onChange={e => {
                    let v = e.target.value.replace(/\D/g, "");
                    if (v) v = (Number(v) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
                    setValorAbertura(v);
                  }} style={{ flex: 1, border: 'none', padding: '15px 15px 15px 0', background: 'none', outline: 'none', fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981' }} required inputMode="numeric" />
              </div>
              <button type="submit" className="btn-entrada" disabled={loadingCaixa}>ABRIR CAIXA</button>
            </form>
          </div>
        )}

        {telaAtual === 'caixa' && sessaoCaixa && (
          <TelaEntrada mostrarToast={mostrarToast} sessaoCaixa={sessaoCaixa} onCaixaFechado={() => { setSessaoCaixa(null); navegarPara('resumo'); }} />
        )}
        
        {telaAtual === 'cadastros' && (
          <div className="tela">
            {!subTela ? <TelaMenuCadastros setSubTela={setSubTela} perfil={perfil} /> : (
              <div className="area-subtela">
                <button className="btn-voltar" onClick={() => setSubTela(null)} style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: 'bold', cursor: 'pointer', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  ← Voltar ao Menu
                </button>
                {subTela === 'produtos' && <TelaProdutos mostrarToast={mostrarToast} perfil={perfil} />}
                {subTela === 'fornecedores' && <TelaFornecedores mostrarToast={mostrarToast} />}
                {subTela === 'categorias' && <TelaCategorias mostrarToast={mostrarToast} />}
                {subTela === 'pagamentos' && <TelaFormasPagamento mostrarToast={mostrarToast} />}
                {subTela === 'perfil' && <TelaPerfil perfil={perfil} mostrarToast={mostrarToast} />}
                {subTela === 'usuarios' && <TelaUsuarios perfil={perfil} mostrarToast={mostrarToast} />}
              </div>
            )}
          </div>
        )}
        {telaAtual === 'relatorios' && <TelaRelatorios />}
      </div>
    </div>
  );
}
export default App;