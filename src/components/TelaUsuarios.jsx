import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const IconUser = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const IconShield = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;

export default function TelaUsuarios({ mostrarToast }) {
  const [usuarios, setUsuarios] = useState([]);
  const [telaAtual, setTelaAtual] = useState('lista');
  const [loading, setLoading] = useState(false);

  // Adicionado o 'username' de volta ao estado inicial
  const estadoInicial = { 
    id: null, nome: '', username: '', email: '', tipo: 'caixa', ativo: true,
    perm_produtos: false, perm_fornecedores: false, perm_categorias: false, perm_pagamentos: false 
  };
  const [form, setForm] = useState(estadoInicial);

  useEffect(() => { carregarUsuarios(); }, []);

  const carregarUsuarios = async () => {
    const { data } = await supabase.from('usuarios').select('*').order('nome');
    if (data) setUsuarios(data);
  };

  const salvarUsuario = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Limpa o username (tira o @ se o adm digitar e remove espaços)
    const cleanUsername = form.username.replace('@', '').toLowerCase().trim();

    const dadosSalvar = {
      nome: form.nome.toUpperCase(),
      username: cleanUsername,
      email: form.email.toLowerCase().trim(),
      tipo: form.tipo,
      ativo: form.ativo,
      // Se for ADM, as permissões extras vão zeradas pois ele já tem acesso a tudo
      perm_produtos: form.tipo === 'adm' ? false : form.perm_produtos,
      perm_fornecedores: form.tipo === 'adm' ? false : form.perm_fornecedores,
      perm_categorias: form.tipo === 'adm' ? false : form.perm_categorias,
      perm_pagamentos: form.tipo === 'adm' ? false : form.perm_pagamentos,
    };

    if (form.id) {
      // ATUALIZAÇÃO
      const { error } = await supabase.from('usuarios').update(dadosSalvar).eq('id', form.id);
      if (!error) { 
        mostrarToast('Usuário atualizado!'); 
        setTelaAtual('lista'); 
        carregarUsuarios(); 
      } else {
        mostrarToast('Erro ao atualizar usuário.', 'erro');
      }
    } else {
      // NOVO CADASTRO
      const senhaPadrao = "123456"; 
      
      // 1. Cria no Auth
      const { data, error: authError } = await supabase.auth.signUp({ 
        email: dadosSalvar.email, 
        password: senhaPadrao 
      });

      if (authError) {
          mostrarToast('Erro de Acesso: ' + authError.message, 'erro');
      } else if (data.user) {
          // 2. Grava na Tabela
          const { error: dbError } = await supabase.from('usuarios').insert([{
              ...dadosSalvar,
              id: data.user.id
          }]);

          if (dbError) {
              mostrarToast('Erro ao gravar perfil: Verifique se o Login já existe.', 'erro');
          } else {
              mostrarToast('Criado! Senha padrão: 123456', 'sucesso'); 
              setTelaAtual('lista'); 
              carregarUsuarios();
          }
      }
    }
    setLoading(false);
  };

  const CheckPerm = ({ label, name }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      <input type="checkbox" checked={form[name]} onChange={e => setForm({ ...form, [name]: e.target.checked })} id={name} style={{ transform: 'scale(1.2)' }} />
      <label htmlFor={name} style={{ fontSize: '0.9rem', color: '#374151', cursor: 'pointer' }}>{label}</label>
    </div>
  );

  if (telaAtual === 'form') {
    return (
      <main className="tela">
        <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><IconUser /> {form.id ? 'GERENCIAR' : 'NOVO'} USUÁRIO</h2>
        <form onSubmit={salvarUsuario} className="form-padrao">
          <input type="text" placeholder="Nome Completo" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} className="input-padrao" required />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
             <input type="text" placeholder="Login (Ex: caixa01)" value={form.username} onChange={e => setForm({...form, username: e.target.value})} className="input-padrao" required />
             <input type="email" placeholder="E-mail" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-padrao" required />
          </div>

          <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#4b5563' }}>Nível de Acesso</label>
          <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} className="input-padrao">
            <option value="caixa">CAIXA (OPERADOR)</option>
            <option value="adm">ADMINISTRADOR (DONO)</option>
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', backgroundColor: form.ativo ? '#f0fdf4' : '#fef2f2', borderRadius: '10px' }}>
            <input type="checkbox" checked={form.ativo} onChange={e => setForm({...form, ativo: e.target.checked})} id="userAtivo" style={{ transform: 'scale(1.5)' }} />
            <label htmlFor="userAtivo" style={{ fontSize: '0.9rem', fontWeight: 'bold', color: form.ativo ? '#166534' : '#991b1b' }}>
                {form.ativo ? 'CONTA ATIVA' : 'CONTA DESATIVADA (Acesso Bloqueado)'}
            </label>
          </div>

          {form.tipo === 'caixa' && (
            <div style={{ padding: '15px', backgroundColor: '#f3f4f6', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4f46e5', display: 'flex', alignItems: 'center', gap: '6px' }}><IconShield /> PERMISSÕES DE TELA</label>
              <CheckPerm label="Gerenciar Produtos" name="perm_produtos" />
              <CheckPerm label="Gerenciar Fornecedores" name="perm_fornecedores" />
              <CheckPerm label="Gerenciar Categorias" name="perm_categorias" />
              <CheckPerm label="Gerenciar Formas de Pagto" name="perm_pagamentos" />
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={() => setTelaAtual('lista')} className="btn-secundario" style={{ flex: 1 }}>VOLTAR</button>
            <button type="submit" className="btn-entrada" style={{ flex: 2 }} disabled={loading}>SALVAR ALTERAÇÕES</button>
          </div>
        </form>
      </main>
    );
  }

  return (
    <main className="tela">
      <h2><IconUser /> GESTÃO DE USUÁRIOS</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
        {usuarios.map(u => (
          <div key={u.id} onClick={() => { setForm(u); setTelaAtual('form'); }} style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '12px', border: '1px solid #e5e7eb', cursor: 'pointer', opacity: u.ativo ? 1 : 0.5 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{u.nome} {!u.ativo && '(INATIVO)'}</strong>
              <span style={{ fontSize: '0.7rem', backgroundColor: u.tipo === 'adm' ? '#eef2ff' : '#f3f4f6', color: u.tipo === 'adm' ? '#4f46e5' : '#6b7280', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' }}>{u.tipo.toUpperCase()}</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '5px' }}>Login: @{u.username} | {u.email}</p>
          </div>
        ))}
        <button onClick={() => { setForm(estadoInicial); setTelaAtual('form'); }} className="btn-entrada" style={{ marginTop: '10px' }}>+ NOVO USUÁRIO</button>
      </div>
    </main>
  );
}

// import React, { useState, useEffect } from 'react';
// import { supabase } from '../supabaseClient';

// export default function TelaUsuarios({ perfil, mostrarToast }) {
//   const [usuarios, setUsuarios] = useState([]);
//   const [telaAtual, setTelaAtual] = useState('lista'); // 'lista' ou 'form'
//   const [loading, setLoading] = useState(false);
  
//   // Estado para o formulário
//   const [form, setForm] = useState({ id: null, nome: '', email: '', username: '', tipo: 'caixa', ativo: true, senhaProv: '' });

//   useEffect(() => {
//     if (telaAtual === 'lista') carregarUsuarios();
//   }, [telaAtual]);

//   const carregarUsuarios = async () => {
//     const { data, error } = await supabase.from('usuarios').select('*').order('nome');
//     if (data) setUsuarios(data);
//     if (error) mostrarToast('Erro ao buscar usuários', 'erro');
//   };

//   const abrirFormulario = (usuario = null) => {
//     if (usuario) {
//       setForm({ ...usuario, senhaProv: '' }); // Edição
//     } else {
//       setForm({ id: null, nome: '', email: '', username: '', tipo: 'caixa', ativo: true, senhaProv: '' }); // Novo
//     }
//     setTelaAtual('form');
//   };

//   const salvarUsuario = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     if (form.id) {
//       // MODO EDIÇÃO
//       const { error: dbError } = await supabase.from('usuarios').update({
//         nome: form.nome,
//         username: form.username.toLowerCase(),
//         tipo: form.tipo,
//         ativo: form.ativo
//       }).eq('id', form.id);

//       if (dbError) mostrarToast('Erro ao atualizar.', 'erro');
//       else {
//         if (form.senhaProv) {
//           mostrarToast('Perfil atualizado! (Obs: Alterar senha de terceiros requer integração com Backend)', 'sucesso');
//         } else {
//           mostrarToast('Funcionário atualizado com sucesso!', 'sucesso');
//         }
//         setTelaAtual('lista');
//       }
//     } else {
//       // MODO CADASTRO (Novo Usuário)
//       if (!form.senhaProv) return mostrarToast('Informe uma senha provisória.', 'erro');
      
//       const { data: authData, error: authError } = await supabase.auth.signUp({
//         email: form.email, password: form.senhaProv
//       });

//       if (authError) {
//         mostrarToast(authError.message, 'erro');
//       } else {
//         const { error: dbError } = await supabase.from('usuarios').insert([{ 
//           id: authData.user.id, nome: form.nome, username: form.username.toLowerCase(), email: form.email, tipo: form.tipo 
//         }]);
//         if (dbError) mostrarToast('Erro ao salvar no banco.', 'erro');
//         else {
//           mostrarToast('Funcionário cadastrado com sucesso!', 'sucesso');
//           setTelaAtual('lista');
//         }
//       }
//     }
//     setLoading(false);
//   };

//   const excluirUsuario = async () => {
//     if(!window.confirm('Tem certeza que deseja excluir este usuário?')) return;
    
//     // Exclui da nossa tabela (o Supabase não deixa excluir de auth.users pelo front-end por segurança)
//     const { error } = await supabase.from('usuarios').delete().eq('id', form.id);
//     if (error) mostrarToast('Erro ao excluir usuário.', 'erro');
//     else {
//       mostrarToast('Usuário removido da listagem.', 'sucesso');
//       setTelaAtual('lista');
//     }
//   };

//   // --- VISUALIZAÇÃO DO FORMULÁRIO ---
//   if (telaAtual === 'form') {
//     return (
//       <main className="tela" style={{ paddingBottom: '30px' }}>
//         <h2>{form.id ? 'EDITAR FUNCIONÁRIO' : 'NOVO FUNCIONÁRIO'}</h2>
//         <form onSubmit={salvarUsuario} className="form-padrao">
//           <input type="text" placeholder="Nome Completo" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} className="input-padrao" required />
//           <input type="text" placeholder="Nome de Usuário (Login)" value={form.username} onChange={e => setForm({...form, username: e.target.value})} className="input-padrao" required />
//           <input type="email" placeholder="E-mail" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-padrao" required disabled={!!form.id} />
//           <input type="password" placeholder={form.id ? "Nova senha (Opcional)" : "Senha provisória"} value={form.senhaProv} onChange={e => setForm({...form, senhaProv: e.target.value})} className="input-padrao" />
          
//           <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} className="input-padrao">
//             <option value="caixa">Operador de Caixa</option>
//             <option value="adm">Administrador (Gerente)</option>
//           </select>

//           {form.id && (
//             <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
//               <input type="checkbox" checked={form.ativo} onChange={e => setForm({...form, ativo: e.target.checked})} id="chkAtivo" style={{ transform: 'scale(1.5)' }} />
//               <label htmlFor="chkAtivo" style={{ fontWeight: '600', color: form.ativo ? '#10b981' : '#ef4444' }}>
//                 {form.ativo ? 'CONTA ATIVA' : 'CONTA SUSPENSA'}
//               </label>
//             </div>
//           )}

//           <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
//             <button type="button" className="btn-secundario" onClick={() => setTelaAtual('lista')} style={{ flex: 1 }}>CANCELAR</button>
//             <button type="submit" className="btn-entrada" style={{ flex: 1 }} disabled={loading}>SALVAR</button>
//           </div>

//           {form.id && (
//             <button type="button" onClick={excluirUsuario} style={{ backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #ef4444', marginTop: '15px' }}>
//               EXCLUIR USUÁRIO
//             </button>
//           )}
//         </form>
//       </main>
//     );
//   }

//   // --- VISUALIZAÇÃO DA LISTA ---
//   return (
//     <main className="tela" style={{ paddingBottom: '30px' }}>
//       <h2>👥 FUNCIONÁRIOS</h2>
//       <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
        
//         {usuarios.map(user => (
//           <div 
//             key={user.id} 
//             onClick={() => abrirFormulario(user)}
//             style={{ 
//               backgroundColor: '#f9fafb', padding: '15px', borderRadius: '12px', border: '1px solid #e5e7eb', 
//               cursor: 'pointer', opacity: user.ativo ? 1 : 0.6 
//             }}
//           >
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//               <strong style={{ color: '#374151' }}>{user.nome}</strong>
//               <span style={{ fontSize: '0.75rem', backgroundColor: user.tipo === 'adm' ? '#eef2ff' : '#ecfdf5', color: user.tipo === 'adm' ? '#4f46e5' : '#10b981', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
//                 {user.tipo.toUpperCase()}
//               </span>
//             </div>
//             <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '5px' }}>Login: @{user.username}</p>
//             <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '8px', borderTop: '1px dashed #d1d5db', paddingTop: '8px' }}>
//               Último acesso: {user.ultimo_login ? new Date(user.ultimo_login).toLocaleString('pt-BR') : 'Nunca acessou'}
//             </p>
//           </div>
//         ))}

//         <button className="btn-entrada" onClick={() => abrirFormulario()} style={{ marginTop: '20px' }}>
//           + CADASTRAR USUÁRIO
//         </button>
//       </div>
//     </main>
//   );
// }