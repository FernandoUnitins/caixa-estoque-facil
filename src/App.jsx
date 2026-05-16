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
import { House } from 'lucide-react';
import { FolderPen } from 'lucide-react';



// Ícones para a Navbar
const IconMenu = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;
const IconClose = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const IconHome = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>;
const IconCash = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>;
const IconFolder = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>;
const IconUser = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"></circle><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path></svg>;
const IconLock = () => <svg width="48" height="48" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;

// Ajustado para receber tamanhos customizados no Modal
const IconLogOut = ({ size = "18", color = "currentColor" }) => <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;

function App() {
  const [session, setSession] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [telaAtual, setTelaAtual] = useState('');
  const [subTela, setSubTela] = useState(null);
  const [toast, setToast] = useState({ visivel: false, mensagem: '', tipo: '' });
  
  const [sessaoCaixa, setSessaoCaixa] = useState(null);
  const [valorAbertura, setValorAbertura] = useState('');
  const [loadingCaixa, setLoadingCaixa] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  
  // Estado para controlar o modal de confirmação de saída
  const [modalLogout, setModalLogout] = useState(false);

  const mostrarToast = (mensagem, tipo = 'sucesso') => {
    setToast({ visivel: true, mensagem, tipo });
    setTimeout(() => setToast({ visivel: false, mensagem: '', tipo: '' }), 3000);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) carregarDadosIniciais(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) carregarDadosIniciais(session.user.id);
      else { setPerfil(null); setSessaoCaixa(null); setTelaAtual(''); setSubTela(null); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const carregarDadosIniciais = async (userId) => {
    const { data: user } = await supabase.from('usuarios').select('*').eq('id', userId).single();
    if (user) {
      setPerfil(user);
      // Redireciona o ADM para o resumo e o Caixa para o PDV
      setTelaAtual(user.tipo === 'caixa' ? 'caixa' : 'resumo');
    }
    const { data: sessao } = await supabase.from('caixas_sessoes').select('*').eq('usuario_id', userId).eq('status', 'ABERTO').maybeSingle(); 
    setSessaoCaixa(sessao || null);
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

if (!session) {
    return (
      <div className="app-container auth-container">
        {/* A LINHA ABAIXO É A MÁGICA QUE FAZ O AVISO APARECER NA TELA DE LOGIN */}
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
      
      {/* MODAL DE CONFIRMAÇÃO DE LOGOUT (SISTEMA) */}
      {modalLogout && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '16px', width: '90%', maxWidth: '350px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px', color: '#ef4444' }}>
              <IconLogOut size="48" color="#ef4444" />
            </div>
            <h3 style={{ margin: '0 0 10px 0', color: '#374151', fontSize: '1.2rem' }}>Sair do Sistema</h3>
            <p style={{ color: '#6b7280', marginBottom: '25px', fontSize: '0.95rem' }}>Tem certeza que deseja encerrar a sua sessão agora?</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-secundario" onClick={() => setModalLogout(false)} style={{ flex: 1, margin: 0 }}>CANCELAR</button>
              <button className="btn-saida" onClick={confirmarESair} style={{ flex: 1, margin: 0 }}>SAIR</button>
            </div>
          </div>
        </div>
      )}

      <header className="navbar">
        <div className="navbar-brand">
          CEF - Caixa & Estoque
        </div>

        <nav className="nav-links-desktop">
          {perfil.tipo === 'adm' && (
            <button onClick={() => navegarPara('resumo')} className={telaAtual === 'resumo' ? 'ativo' : ''}><House /> Início</button>
          )}
          <button onClick={() => navegarPara('caixa')} className={telaAtual === 'caixa' ? 'ativo' : ''}><IconCash /> Caixa</button>
          
          {mostrarMenuCadastros && (
            <button onClick={() => navegarPara('cadastros')} className={telaAtual === 'cadastros' ? 'ativo' : ''}><FolderPen /> Cadastros</button>
          )}

          <div className="navbar-user-info">
            <span><IconUser /> {perfil.nome}</span>
            {/* Dispara o Modal em vez de deslogar na hora */}
            <button onClick={() => setModalLogout(true)}><IconLogOut /> Sair</button>
          </div>
        </nav>

        <button className="btn-hamburguer" onClick={() => setMenuAberto(!menuAberto)}>
          {menuAberto ? <IconClose /> : <IconMenu />}
        </button>

        {menuAberto && (
          <div className="menu-mobile-overlay">
            {perfil.tipo === 'adm' && <button onClick={() => navegarPara('resumo')}><IconHome /> Início</button>}
            <button onClick={() => navegarPara('caixa')}><IconCash /> Caixa</button>
            {mostrarMenuCadastros && <button onClick={() => navegarPara('cadastros')}><IconFolder /> Cadastros e Perfil</button>}
            
            {/* Dispara o Modal em vez de deslogar na hora */}
            <button onClick={() => { setMenuAberto(false); setModalLogout(true); }} style={{color: '#ef4444', borderTop: '1px dashed #eee', marginTop: '10px'}}>
              <IconLogOut /> Sair do Sistema
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
                  }} style={{ flex: 1, border: 'none', padding: '15px 15px 15px 0', background: 'none', outline: 'none', fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981' }} required />
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
      </div>
    </div>
  );
}
export default App;

// import React, { useState, useEffect } from 'react';
// import { supabase } from './supabaseClient';
// import './App.css';

// import TelaLogin from './components/TelaLogin';
// import TelaResumo from './components/TelaResumo';
// import TelaEntrada from './components/TelaEntrada'; 
// import TelaMenuCadastros from './components/TelaMenuCadastros';
// import TelaProdutos from './components/TelaProdutos';
// import TelaCategorias from './components/TelaCategorias';
// import TelaFornecedores from './components/TelaFornecedores';
// import TelaFormasPagamento from './components/TelaFormasPagamento';
// import TelaPerfil from './components/TelaPerfil';
// import TelaUsuarios from './components/TelaUsuarios';

// import iconeCaixa from './assets/cash-machine.png'; 
// import iconeHome from './assets/home.png'; 
// import iconeCadastro from './assets/edit.png'; 

// //const IconHome = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;



// //const IconCashRegister = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line><line x1="12" y1="15" x2="12" y2="15"></line></svg>;

// const IconFolder = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>;
// const IconUser = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
// const IconLogOut = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
// const IconLock = () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;

// function App() {
//   const [session, setSession] = useState(null);
//   const [perfil, setPerfil] = useState(null);
//   const [telaAtual, setTelaAtual] = useState('');
//   const [subTela, setSubTela] = useState(null);
//   const [toast, setToast] = useState({ visivel: false, mensagem: '', tipo: '' });
//   const [sessaoCaixa, setSessaoCaixa] = useState(null);
//   const [valorAbertura, setValorAbertura] = useState('');
//   const [loadingCaixa, setLoadingCaixa] = useState(false);

//   const mostrarToast = (mensagem, tipo = 'sucesso') => {
//     setToast({ visivel: true, mensagem, tipo });
//     setTimeout(() => setToast({ visivel: false, mensagem: '', tipo: '' }), 3000);
//   };

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setSession(session);
//       if (session) carregarDadosIniciais(session.user.id);
//     });
//     const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
//       setSession(session);
//       if (session) carregarDadosIniciais(session.user.id);
//       else { setPerfil(null); setSessaoCaixa(null); setTelaAtual(''); setSubTela(null); }
//     });
//     return () => subscription.unsubscribe();
//   }, []);

//   const carregarDadosIniciais = async (userId) => {
//     const { data: user } = await supabase.from('usuarios').select('*').eq('id', userId).single();
//     if (user) {
//       setPerfil(user);
//       await supabase.from('usuarios').update({ ultimo_login: new Date().toISOString() }).eq('id', userId);
//       setTelaAtual(user.tipo === 'caixa' ? 'caixa' : 'resumo');
//     }
//     verificarCaixaAberto(userId);
//   };

//   const verificarCaixaAberto = async (userId) => {
//     const { data } = await supabase.from('caixas_sessoes').select('*').eq('usuario_id', userId).eq('status', 'ABERTO').maybeSingle(); 
//     setSessaoCaixa(data || null);
//   };

//   // ==========================================
//   // FUNÇÕES DE MÁSCARA E CÁLCULO
//   // ==========================================
//   const mascaraMoeda = (valor) => {
//     if (valor === '' || valor === undefined || valor === null) return '';
//     let v = String(valor).replace(/\D/g, ""); 
//     if (v === '') return '';
//     return (Number(v) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
//   };

//   const parseMoeda = (valor) => {
//     if (!valor) return 0;
//     const cleanString = String(valor).replace(/[^\d,]/g, '');
//     return parseFloat(cleanString.replace(',', '.')) || 0;
//   };

//   const abrirCaixa = async (e) => {
//     e.preventDefault();
//     setLoadingCaixa(true);
    
//     // Converte a string mascarada para número para salvar no banco
//     const valorAberturaNum = parseMoeda(valorAbertura);

//     const { data, error } = await supabase.from('caixas_sessoes').insert([{
//       usuario_id: session.user.id,
//       valor_abertura: valorAberturaNum,
//       status: 'ABERTO'
//     }]).select();
    
//     if (error) mostrarToast('Erro ao abrir o caixa.', 'erro');
//     else { 
//       mostrarToast('Caixa aberto!', 'sucesso'); 
//       setSessaoCaixa(data[0]); 
//       setValorAbertura(''); 
//     }
//     setLoadingCaixa(false);
//   };

//   const handleLogout = async () => { await supabase.auth.signOut(); };

//   // Lógica de Permissões para o Menu de Cadastros
//   const temAlgumaPermissaoCadastro = perfil?.tipo === 'adm' || perfil?.perm_produtos || perfil?.perm_fornecedores || perfil?.perm_categorias || perfil?.perm_pagamentos;

//   if (!session) return <div className="app-container auth-container"><TelaLogin mostrarToast={mostrarToast} /></div>;
//   if (!perfil) return <div className="app-container" style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}}>Carregando...</div>;

//   return (
//     <div className="app-container">
//       {toast.visivel && <div className={`toast-container toast-${toast.tipo}`}>{toast.mensagem}</div>}
//       <div className="topo-app">
//         <span className="usuario-logado"><IconUser /> {perfil.nome} ({perfil.tipo.toUpperCase()})</span>
//         <button className="btn-sair" onClick={handleLogout}><IconLogOut /> Sair</button>
//       </div>

//       <div className="conteudo-dinamico">
//         {telaAtual === 'resumo' && perfil.tipo === 'adm' && <TelaResumo sessaoCaixa={sessaoCaixa} setTelaAtual={setTelaAtual} />}
        
//         {telaAtual === 'caixa' && !sessaoCaixa && (
//           <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', height: '100%' }}>
//             <IconLock />
//             <h2 style={{ color: '#374151', marginTop: '15px', textAlign: 'center' }}>CAIXA FECHADO</h2>
//             <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '20px', fontSize: '0.9rem' }}>Para começar a operar, informe o fundo de troco inicial da gaveta.</p>

//             <form onSubmit={abrirCaixa} className="form-padrao" style={{ width: '100%', maxWidth: '350px' }}>
//               <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '8px', overflow: 'hidden', marginBottom: '15px' }}>
//                 <span style={{ paddingLeft: '15px', paddingRight: '10px', color: '#6b7280', fontWeight: 'bold' }}>R$</span>
//                 <input 
//                   type="text" 
//                   placeholder="0,00" 
//                   value={valorAbertura} 
//                   onChange={e => setValorAbertura(mascaraMoeda(e.target.value))} 
//                   style={{ flex: 1, border: 'none', padding: '15px 15px 15px 0', outline: 'none', fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981' }} 
//                   required 
//                 />
//               </div>
//               <button type="submit" className="btn-entrada" disabled={loadingCaixa}>
//                 {loadingCaixa ? 'ABRINDO...' : 'ABRIR CAIXA'}
//               </button>
//             </form>
//           </div>
//         )}

//         {telaAtual === 'caixa' && sessaoCaixa && (
//           <TelaEntrada setTelaAtual={setTelaAtual} mostrarToast={mostrarToast} sessaoCaixa={sessaoCaixa} onCaixaFechado={() => { setSessaoCaixa(null); setTelaAtual(perfil.tipo === 'adm' ? 'resumo' : 'caixa'); }} />
//         )}
        
//         {telaAtual === 'cadastros' && temAlgumaPermissaoCadastro && (
//           !subTela ? (
//             <TelaMenuCadastros setSubTela={setSubTela} perfil={perfil} />
//           ) : (
//             <div className="area-subtela">
//               <button className="btn-voltar" onClick={() => setSubTela(null)}>← Voltar</button>
//               {subTela === 'produtos' && (perfil.tipo === 'adm' || perfil.perm_produtos) && <TelaProdutos mostrarToast={mostrarToast} perfil={perfil} />}
//               {subTela === 'fornecedores' && (perfil.tipo === 'adm' || perfil.perm_fornecedores) && <TelaFornecedores mostrarToast={mostrarToast} />}
//               {subTela === 'categorias' && (perfil.tipo === 'adm' || perfil.perm_categorias) && <TelaCategorias mostrarToast={mostrarToast} />}
//               {subTela === 'pagamentos' && (perfil.tipo === 'adm' || perfil.perm_pagamentos) && <TelaFormasPagamento mostrarToast={mostrarToast} />}
//               {subTela === 'perfil' && <TelaPerfil perfil={perfil} mostrarToast={mostrarToast} />}
//               {subTela === 'usuarios' && perfil.tipo === 'adm' && <TelaUsuarios perfil={perfil} mostrarToast={mostrarToast} />}
//             </div>
//           )
//         )}

//         {telaAtual === 'perfil' && perfil.tipo === 'caixa' && <TelaPerfil perfil={perfil} mostrarToast={mostrarToast} />}
//       </div>

//       <nav className="menu-inferior">
//         {perfil.tipo === 'adm' && <button onClick={() => setTelaAtual('resumo')} className={telaAtual === 'resumo' ? 'ativo' : ''}>
//           <img 
//     src={iconeHome} 
//     alt="Ínicio" 
//     style={{ width: '24px', height: '24px', objectFit: 'contain' }} 
//   />Início</button>}
       
       
       
       
//         <button onClick={() => setTelaAtual('caixa')} className={telaAtual === 'caixa' ? 'ativo' : ''}>
//           <img 
//     src={iconeCaixa} 
//     alt="Ícone Caixa" 
//     style={{ width: '24px', height: '24px', objectFit: 'contain' }} 
//   />Caixa</button>
       
       
//         {temAlgumaPermissaoCadastro && <button onClick={() => setTelaAtual('cadastros')} className={telaAtual === 'cadastros' ? 'ativo' : ''}><img 
//     src={iconeCadastro} 
//     alt="Cadastros" 
//     style={{ width: '24px', height: '24px', objectFit: 'contain' }} 
//   />Cadastros</button>}
        
        
        
        
//         {perfil.tipo === 'caixa' && <button onClick={() => setTelaAtual('perfil')} className={telaAtual === 'perfil' ? 'ativo' : ''}><IconUser /> Perfil</button>}
//       </nav>
//     </div>
//   );
// }
// export default App;








// import React, { useState, useEffect } from 'react';
// import { supabase } from './supabaseClient';
// import './App.css';

// import TelaLogin from './components/TelaLogin';
// import TelaResumo from './components/TelaResumo';
// import TelaEntrada from './components/TelaEntrada'; // Nosso Frente de Caixa (PDV)
// import TelaMenuCadastros from './components/TelaMenuCadastros';
// import TelaProdutos from './components/TelaProdutos';
// import TelaCategorias from './components/TelaCategorias';
// import TelaFornecedores from './components/TelaFornecedores';
// import TelaFormasPagamento from './components/TelaFormasPagamento';
// import TelaPerfil from './components/TelaPerfil';
// import TelaUsuarios from './components/TelaUsuarios';

// // ==========================================
// // ÍCONES SVG GLOBAIS
// // ==========================================
// const IconHome = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
// const IconCashRegister = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line><line x1="12" y1="15" x2="12" y2="15"></line></svg>;
// const IconFolder = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>;
// const IconUser = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
// const IconLogOut = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
// const IconLock = () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;

// function App() {
//   const [session, setSession] = useState(null);
//   const [perfil, setPerfil] = useState(null);
//   const [telaAtual, setTelaAtual] = useState('resumo');
//   const [subTela, setSubTela] = useState(null);
//   const [toast, setToast] = useState({ visivel: false, mensagem: '', tipo: '' });
  
//   // Estados de Controle do Caixa/Turno
//   const [sessaoCaixa, setSessaoCaixa] = useState(null);
//   const [valorAbertura, setValorAbertura] = useState('');
//   const [loadingCaixa, setLoadingCaixa] = useState(false);

//   const mostrarToast = (mensagem, tipo = 'sucesso') => {
//     setToast({ visivel: true, mensagem, tipo });
//     setTimeout(() => setToast({ visivel: false, mensagem: '', tipo: '' }), 3000);
//   };

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setSession(session);
//       if (session) carregarDadosIniciais(session.user.id);
//     });

//     const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
//       setSession(session);
//       if (session) {
//         carregarDadosIniciais(session.user.id);
//       } else { 
//         setPerfil(null); 
//         setSessaoCaixa(null);
//         setTelaAtual('resumo'); 
//         setSubTela(null); 
//       }
//     });

//     return () => subscription.unsubscribe();
//   }, []);

//   const carregarDadosIniciais = async (userId) => {
//     // 1. Carrega Perfil
//     const { data: user } = await supabase.from('usuarios').select('*').eq('id', userId).single();
//     if (user) {
//       setPerfil(user);
//       await supabase.from('usuarios').update({ ultimo_login: new Date().toISOString() }).eq('id', userId);
//     }
//     // 2. Verifica se este usuário tem um caixa aberto hoje
//     verificarCaixaAberto(userId);
//   };

//   const verificarCaixaAberto = async (userId) => {
//     const { data } = await supabase.from('caixas_sessoes')
//       .select('*')
//       .eq('usuario_id', userId)
//       .eq('status', 'ABERTO')
//       .maybeSingle(); 
      
//     setSessaoCaixa(data || null);
//   };

//   // ==========================================
//   // FUNÇÕES DE ABERTURA DE CAIXA
//   // ==========================================
//   const mascaraMoeda = (valor) => {
//     if (valor === '' || valor === undefined || valor === null) return '';
//     let v = String(valor).replace(/\D/g, ""); 
//     if (v === '') return '';
//     return (Number(v) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
//   };

//   const parseMoeda = (valor) => {
//     if (!valor) return 0;
//     const cleanString = String(valor).replace(/[^\d,]/g, '');
//     return parseFloat(cleanString.replace(',', '.')) || 0;
//   };

//   const abrirCaixa = async (e) => {
//     e.preventDefault();
//     setLoadingCaixa(true);

//     const valorAberturaNum = parseMoeda(valorAbertura);

//     const { data, error } = await supabase.from('caixas_sessoes').insert([{
//       usuario_id: session.user.id,
//       valor_abertura: valorAberturaNum,
//       status: 'ABERTO'
//     }]).select();

//     if (error) {
//       mostrarToast('Erro ao abrir o caixa.', 'erro');
//     } else {
//       mostrarToast('Caixa aberto com sucesso!', 'sucesso');
//       setSessaoCaixa(data[0]);
//       setValorAbertura('');
//     }
//     setLoadingCaixa(false);
//   };

//   const handleLogout = async () => {
//     await supabase.auth.signOut();
//     mostrarToast('Você saiu do sistema.', 'sucesso');
//   };

//   if (!session) {
//     return (
//       <div className="app-container auth-container">
//         {toast.visivel && <div className={`toast-container toast-${toast.tipo}`}>{toast.mensagem}</div>}
//         <TelaLogin mostrarToast={mostrarToast} />
//       </div>
//     );
//   }

//   return (
//     <div className="app-container">
//       {toast.visivel && <div className={`toast-container toast-${toast.tipo}`}>{toast.mensagem}</div>}
      
//       <div className="topo-app">
//         <span className="usuario-logado" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
//           <IconUser /> {perfil ? perfil.nome : 'Carregando...'} ({perfil?.tipo})
//         </span>
//         <button className="btn-sair" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
//           <IconLogOut /> Sair
//         </button>
//       </div>

//       <div className="conteudo-dinamico">
//         {/* Passamos o sessaoCaixa para a tela Resumo para mostrar o status 🟢 / 🔴 no futuro */}
//         {telaAtual === 'resumo' && <TelaResumo sessaoCaixa={sessaoCaixa} setTelaAtual={setTelaAtual} />}
        
//         {/* FLUXO DE INTERCEPTAÇÃO DO CAIXA */}
//         {telaAtual === 'caixa' && !sessaoCaixa && (
//           <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', height: '100%' }}>
//             <IconLock />
//             <h2 style={{ color: '#374151', marginTop: '15px', textAlign: 'center' }}>CAIXA FECHADO</h2>
//             <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '20px', fontSize: '0.9rem' }}>Para começar a operar, informe o fundo de troco inicial da gaveta.</p>
            
//             <form onSubmit={abrirCaixa} className="form-padrao" style={{ width: '100%', maxWidth: '350px' }}>
//               <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4b5563', paddingLeft: '4px' }}>Fundo de Troco Inicial (R$)</label>
//               <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '8px', overflow: 'hidden', marginBottom: '15px', marginTop: '5px' }}>
//                 <span style={{ paddingLeft: '15px', paddingRight: '10px', color: '#6b7280', fontWeight: 'bold' }}>R$</span>
//                 <input 
//                   type="text" 
//                   placeholder="0,00" 
//                   value={valorAbertura} 
//                   onChange={e => setValorAbertura(mascaraMoeda(e.target.value))} 
//                   style={{ flex: 1, border: 'none', padding: '15px 15px 15px 0', outline: 'none', fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981' }} 
//                   required 
//                 />
//               </div>
//               <button type="submit" className="btn-entrada" disabled={loadingCaixa} style={{ margin: 0, height: '55px', fontSize: '1.1rem' }}>
//                 {loadingCaixa ? 'ABRINDO...' : 'ABRIR CAIXA'}
//               </button>
//             </form>
//           </div>
//         )}

//         {/* SE O CAIXA ESTIVER ABERTO, LIBERA A FRENTE DE CAIXA (PDV) */}
//         {telaAtual === 'caixa' && sessaoCaixa && (
//           <TelaEntrada 
//             setTelaAtual={setTelaAtual} 
//             mostrarToast={mostrarToast} 
//             sessaoCaixa={sessaoCaixa} 
//             onCaixaFechado={() => { setSessaoCaixa(null); setTelaAtual('resumo'); }}
//           />
//         )}
        
//         {telaAtual === 'cadastros' && (
//           !subTela ? (
//             <TelaMenuCadastros setSubTela={setSubTela} perfil={perfil} />
//           ) : (
//             <div className="area-subtela">
//               <button className="btn-voltar" onClick={() => setSubTela(null)}>← Voltar ao Menu</button>
//               {subTela === 'produtos' && <TelaProdutos mostrarToast={mostrarToast} />}
//               {subTela === 'fornecedores' && <TelaFornecedores mostrarToast={mostrarToast} />}
//               {subTela === 'categorias' && <TelaCategorias mostrarToast={mostrarToast} />}
//               {subTela === 'pagamentos' && <TelaFormasPagamento mostrarToast={mostrarToast} />}
//               {subTela === 'perfil' && <TelaPerfil perfil={perfil} mostrarToast={mostrarToast} />}
//               {subTela === 'usuarios' && <TelaUsuarios perfil={perfil} mostrarToast={mostrarToast} />}
//             </div>
//           )
//         )}
//       </div>

//       <nav className="menu-inferior">
//         <button onClick={() => {setTelaAtual('resumo'); setSubTela(null)}} className={telaAtual === 'resumo' ? 'ativo' : ''} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
//           <IconHome /> <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Início</span>
//         </button>
//         <button onClick={() => { setSubTela(null); setTelaAtual('caixa'); }} className={telaAtual === 'caixa' ? 'ativo' : ''} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
//           <IconCashRegister /> <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Caixa</span>
//         </button>
//         <button onClick={() => {setTelaAtual('cadastros'); setSubTela(null)}} className={telaAtual === 'cadastros' ? 'ativo' : ''} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
//           <IconFolder /> <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Cadastros</span>
//         </button>
//       </nav>
//     </div>
//   );
// }

// export default App;








// // import React, { useState, useEffect } from 'react';
// // import { supabase } from './supabaseClient';
// // import './App.css';

// // import TelaLogin from './components/TelaLogin';
// // import TelaResumo from './components/TelaResumo';
// // import TelaEntrada from './components/TelaEntrada';
// // import TelaSaida from './components/TelaSaida';
// // import TelaMenuCadastros from './components/TelaMenuCadastros';
// // import TelaProdutos from './components/TelaProdutos';
// // import TelaCategorias from './components/TelaCategorias';
// // import TelaFornecedores from './components/TelaFornecedores';
// // import TelaFormasPagamento from './components/TelaFormasPagamento';
// // import TelaPerfil from './components/TelaPerfil';
// // import TelaUsuarios from './components/TelaUsuarios';

// // function App() {
// //   const [session, setSession] = useState(null);
// //   const [perfil, setPerfil] = useState(null);
// //   const [telaAtual, setTelaAtual] = useState('resumo');
// //   const [subTela, setSubTela] = useState(null);
// //   const [toast, setToast] = useState({ visivel: false, mensagem: '', tipo: '' });
  
// //   // Controle dos Dialogs de Caixa
// //   const [modalCaixa, setModalCaixa] = useState(null); // 'tipo' | 'metodo_entrada'
// //   const [iniciarComScanner, setIniciarComScanner] = useState(false);

// //   const mostrarToast = (mensagem, tipo = 'sucesso') => {
// //     setToast({ visivel: true, mensagem, tipo });
// //     setTimeout(() => setToast({ visivel: false, mensagem: '', tipo: '' }), 3000);
// //   };

// //   useEffect(() => {
// //     supabase.auth.getSession().then(({ data: { session } }) => {
// //       setSession(session);
// //       if (session) carregarPerfil(session.user.id);
// //     });
// //     const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
// //       setSession(session);
// //       if (session) carregarPerfil(session.user.id);
// //       else { setPerfil(null); setTelaAtual('resumo'); setSubTela(null); }
// //     });
// //     return () => subscription.unsubscribe();
// //   }, []);

// //   const carregarPerfil = async (userId) => {
// //     const { data } = await supabase.from('usuarios').select('*').eq('id', userId).single();
// //     if (data) {
// //       setPerfil(data);
// //       await supabase.from('usuarios').update({ ultimo_login: new Date().toISOString() }).eq('id', userId);
// //     }
// //   };

// //   const handleLogout = async () => {
// //     await supabase.auth.signOut();
// //     mostrarToast('Você saiu do sistema.', 'sucesso');
// //   };

// //   if (!session) {
// //     return (
// //       <div className="app-container auth-container">
// //         {toast.visivel && <div className={`toast-container toast-${toast.tipo}`}>{toast.mensagem}</div>}
// //         <TelaLogin mostrarToast={mostrarToast} />
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="app-container">
// //       {toast.visivel && <div className={`toast-container toast-${toast.tipo}`}>{toast.mensagem}</div>}
      
// //       <div className="topo-app">
// //         <span className="usuario-logado">👤 {perfil ? perfil.nome : 'Carregando...'} ({perfil?.tipo})</span>
// //         <button className="btn-sair" onClick={handleLogout}>Sair</button>
// //       </div>

// //       {/* DIALOGS DE DECISÃO DO CAIXA */}
// //       {modalCaixa && (
// //         <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
// //           <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '16px', width: '90%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            
// //             {modalCaixa === 'tipo' && (
// //               <>
// //                 <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#374151' }}>Qual tipo de lançamento?</h3>
// //                 <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
// //                   <button onClick={() => setModalCaixa('metodo_entrada')} className="btn-entrada" style={{ padding: '20px', fontSize: '1.1rem' }}>📥 ENTRADA (Venda)</button>
// //                   <button onClick={() => { setTelaAtual('saida'); setModalCaixa(null); }} className="btn-entrada" style={{ padding: '20px', fontSize: '1.1rem', backgroundColor: '#ef4444' }}>📤 SAÍDA (Despesa)</button>
// //                   <button onClick={() => setModalCaixa(null)} className="btn-secundario" style={{ marginTop: '10px' }}>Cancelar</button>
// //                 </div>
// //               </>
// //             )}

// //             {modalCaixa === 'metodo_entrada' && (
// //               <>
// //                 <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#374151' }}>Como deseja iniciar a venda?</h3>
// //                 <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
// //                   <button onClick={() => { setIniciarComScanner(true); setTelaAtual('entrada'); setModalCaixa(null); }} className="btn-entrada" style={{ padding: '20px', fontSize: '1.1rem', backgroundColor: '#374151' }}>📷 LER CÓDIGO DE BARRAS</button>
// //                   <button onClick={() => { setIniciarComScanner(false); setTelaAtual('entrada'); setModalCaixa(null); }} className="btn-entrada" style={{ padding: '20px', fontSize: '1.1rem' }}>⌨️ LANÇAMENTO MANUAL</button>
// //                   <button onClick={() => setModalCaixa('tipo')} className="btn-secundario" style={{ marginTop: '10px' }}>← Voltar</button>
// //                 </div>
// //               </>
// //             )}

// //           </div>
// //         </div>
// //       )}

// //       <div className="conteudo-dinamico">
// //         {telaAtual === 'resumo' && <TelaResumo />}
// //         {telaAtual === 'entrada' && <TelaEntrada setTelaAtual={setTelaAtual} mostrarToast={mostrarToast} iniciarComScanner={iniciarComScanner} />}
// //         {telaAtual === 'saida' && <TelaSaida setTelaAtual={setTelaAtual} mostrarToast={mostrarToast} />}
        
// //         {telaAtual === 'cadastros' && (
// //           !subTela ? (
// //             <TelaMenuCadastros setSubTela={setSubTela} perfil={perfil} />
// //           ) : (
// //             <div className="area-subtela">
// //               <button className="btn-voltar" onClick={() => setSubTela(null)}>← Voltar ao Menu</button>
// //               {subTela === 'produtos' && <TelaProdutos mostrarToast={mostrarToast} />}
// //               {subTela === 'fornecedores' && <TelaFornecedores mostrarToast={mostrarToast} />}
// //               {subTela === 'categorias' && <TelaCategorias mostrarToast={mostrarToast} />}
// //               {subTela === 'pagamentos' && <TelaFormasPagamento mostrarToast={mostrarToast} />}
// //               {subTela === 'perfil' && <TelaPerfil perfil={perfil} mostrarToast={mostrarToast} />}
// //               {subTela === 'usuarios' && <TelaUsuarios perfil={perfil} mostrarToast={mostrarToast} />}
// //             </div>
// //           )
// //         )}
// //       </div>

// //       <nav className="menu-inferior">
// //         <button onClick={() => {setTelaAtual('resumo'); setSubTela(null)}} className={telaAtual === 'resumo' ? 'ativo' : ''}>🏠 Início</button>
// //         <button onClick={() => { setSubTela(null); setModalCaixa('tipo'); }} className={telaAtual === 'entrada' || telaAtual === 'saida' ? 'ativo' : ''}>💸 Caixa</button>
// //         <button onClick={() => {setTelaAtual('cadastros'); setSubTela(null)}} className={telaAtual === 'cadastros' ? 'ativo' : ''}>📂 Cadastros</button>
// //       </nav>
// //     </div>
// //   );
// // }

// // export default App;