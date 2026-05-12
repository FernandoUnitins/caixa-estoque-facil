import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const IconCreditCard = ({ color = "currentColor", size = "24" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
    <line x1="1" y1="10" x2="23" y2="10"></line>
  </svg>
);

export default function TelaFormasPagamento({ mostrarToast }) {
  const [formas, setFormas] = useState([]);
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarFormas();
  }, []);

  const carregarFormas = async () => {
    const { data, error } = await supabase.from('formas_pagamento').select('*').order('nome');
    if (data) setFormas(data);
  };

  const salvarForma = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('formas_pagamento').insert([{ nome: nome.toUpperCase().trim() }]);
    if (error) mostrarToast('Erro ao cadastrar.', 'erro');
    else {
      mostrarToast('Forma de pagamento cadastrada!', 'sucesso');
      setNome('');
      carregarFormas();
    }
    setLoading(false);
  };

  const alternarStatus = async (id, statusAtual) => {
    await supabase.from('formas_pagamento').update({ ativo: !statusAtual }).eq('id', id);
    carregarFormas();
  };

  return (
    <main className="tela" style={{ paddingBottom: '30px' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#4b5563' }}>
        <IconCreditCard size="24" /> FORMAS DE PAGAMENTO
      </h2>
      <form onSubmit={salvarForma} className="form-padrao" style={{ marginTop: '20px' }}>
        <input type="text" placeholder="Nova forma de pagamento" value={nome} onChange={(e) => setNome(e.target.value.toUpperCase())} className="input-padrao" required />
        <button type="submit" className="btn-entrada" disabled={loading}>{loading ? 'SALVANDO...' : 'CADASTRAR'}</button>
      </form>

      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {formas.map(f => (
          <div key={f.id} style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: f.ativo ? 1 : 0.6 }}>
            <strong>{f.nome}</strong>
            <button onClick={() => alternarStatus(f.id, f.ativo)} style={{ backgroundColor: f.ativo ? '#ef4444' : '#10b981', color: 'white', padding: '5px 10px', borderRadius: '6px', fontSize: '0.8rem', border: 'none', fontWeight: 'bold' }}>
              {f.ativo ? 'DESATIVAR' : 'ATIVAR'}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}









// import React, { useState, useEffect } from 'react';
// import { supabase } from '../supabaseClient';

// // ==========================================
// // ÍCONES SVG COM CORES FORÇADAS
// // ==========================================
// const IconCreditCard = ({ color = "currentColor", size = "24" }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
//     <line x1="1" y1="10" x2="23" y2="10"></line>
//   </svg>
// );

// const IconPlus = ({ color = "currentColor", size = "20" }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <line x1="12" y1="5" x2="12" y2="19"></line>
//     <line x1="5" y1="12" x2="19" y2="12"></line>
//   </svg>
// );

// export default function TelaFormasPagamento({ mostrarToast }) {
//   const [formas, setFormas] = useState([]);
//   const [telaAtual, setTelaAtual] = useState('lista'); // 'lista' ou 'form'
//   const [loading, setLoading] = useState(false);

//   // Estado unificado para o formulário
//   const [form, setForm] = useState({ id: null, nome: '', ativo: true });

//   // Carrega as formas de pagamento sempre que a tela voltar para 'lista'
//   useEffect(() => {
//     if (telaAtual === 'lista') carregarFormas();
//   }, [telaAtual]);

//   const carregarFormas = async () => {
//     const { data, error } = await supabase.from('formas_pagamento').select('*').order('nome');
//     if (data) setFormas(data);
//     if (error) mostrarToast('Erro ao buscar formas de pagamento.', 'erro');
//   };

//   const abrirFormulario = (forma = null) => {
//     if (forma) {
//       setForm({ ...forma }); // MODO EDIÇÃO
//     } else {
//       setForm({ id: null, nome: '', ativo: true }); // MODO CADASTRO
//     }
//     setTelaAtual('form');
//   };

//   const salvarForma = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     // Garante que o nome seja salvo em maiúsculo e sem espaços inúteis nas pontas
//     const nomeMaiusculo = form.nome.toUpperCase().trim();

//     if (form.id) {
//       // MODO EDIÇÃO (UPDATE)
//       const { error } = await supabase.from('formas_pagamento')
//         .update({ nome: nomeMaiusculo, ativo: form.ativo })
//         .eq('id', form.id);

//       if (error) {
//         mostrarToast('Erro ao atualizar a forma de pagamento.', 'erro');
//       } else {
//         mostrarToast('Forma de pagamento atualizada com sucesso!', 'sucesso');
//         setTelaAtual('lista');
//       }
//     } else {
//       // MODO CADASTRO (INSERT)
//       const { error } = await supabase.from('formas_pagamento')
//         .insert([{ nome: nomeMaiusculo }]);

//       if (error) {
//         mostrarToast('Erro ao cadastrar forma de pagamento.', 'erro');
//       } else {
//         mostrarToast('Forma de pagamento cadastrada com sucesso!', 'sucesso');
//         setTelaAtual('lista');
//       }
//     }
//     setLoading(false);
//   };

//   // ==========================================
//   // RENDERIZAÇÃO DO MODO: FORMULÁRIO
//   // ==========================================
//   if (telaAtual === 'form') {
//     return (
//       <main className="tela" style={{ paddingBottom: '30px', width: '100%', overflowX: 'hidden' }}>
//         <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#4b5563' }}>
//           <IconCreditCard /> {form.id ? 'EDITAR FORMA DE PAGAMENTO' : 'NOVA FORMA DE PAGAMENTO'}
//         </h2>
        
//         <form onSubmit={salvarForma} className="form-padrao" style={{ marginTop: '20px' }}>
          
//           <input 
//             type="text" 
//             placeholder="NOME (EX: PIX, DINHEIRO)" 
//             value={form.nome} 
//             onChange={(e) => setForm({ ...form, nome: e.target.value.toUpperCase() })} 
//             className="input-padrao" 
//             required
//           />

//           {/* Só mostra a opção de desativar se estiver editando uma existente */}
//           {form.id && (
//             <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
//               <input 
//                 type="checkbox" 
//                 checked={form.ativo} 
//                 onChange={(e) => setForm({ ...form, ativo: e.target.checked })} 
//                 id="chkAtivoPagamento" 
//                 style={{ transform: 'scale(1.5)' }} 
//               />
//               <label htmlFor="chkAtivoPagamento" style={{ fontWeight: '600', color: form.ativo ? '#10b981' : '#ef4444', cursor: 'pointer' }}>
//                 {form.ativo ? 'FORMA ATIVA' : 'FORMA INATIVA'}
//               </label>
//             </div>
//           )}

//           <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
//             <button type="button" className="btn-secundario" onClick={() => setTelaAtual('lista')} style={{ flex: 1, margin: 0 }}>
//               CANCELAR
//             </button>
//             <button type="submit" className="btn-entrada" disabled={loading} style={{ flex: 1, margin: 0 }}>
//               {loading ? 'SALVANDO...' : 'SALVAR'}
//             </button>
//           </div>

//         </form>
//       </main>
//     );
//   }

//   // ==========================================
//   // RENDERIZAÇÃO DO MODO: LISTAGEM
//   // ==========================================
//   return (
//     <main className="tela" style={{ paddingBottom: '30px' }}>
//       <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#4b5563' }}>
//         <IconCreditCard /> FORMAS DE PAGAMENTO
//       </h2>
      
//       <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
        
//         {formas.length === 0 && (
//           <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.9rem', margin: '20px 0' }}>
//             Nenhuma forma de pagamento cadastrada.
//           </p>
//         )}

//         {formas.map(f => (
//           <div 
//             key={f.id} 
//             onClick={() => abrirFormulario(f)}
//             style={{ 
//               backgroundColor: '#f9fafb', 
//               padding: '15px', 
//               borderRadius: '12px', 
//               border: '1px solid #e5e7eb', 
//               cursor: 'pointer', 
//               opacity: f.ativo ? 1 : 0.6,
//               transition: 'background-color 0.2s ease'
//             }}
//           >
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//               <strong style={{ color: '#374151' }}>{f.nome}</strong>
//               <span style={{ 
//                 fontSize: '0.7rem', 
//                 backgroundColor: f.ativo ? '#ecfdf5' : '#fef2f2', 
//                 color: f.ativo ? '#10b981' : '#ef4444', 
//                 padding: '4px 8px', 
//                 borderRadius: '6px', 
//                 fontWeight: 'bold' 
//               }}>
//                 {f.ativo ? 'ATIVA' : 'INATIVA'}
//               </span>
//             </div>
//           </div>
//         ))}

//         <button 
//           className="btn-entrada" 
//           onClick={() => abrirFormulario()} 
//           style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
//         >
//           <IconPlus /> NOVA FORMA DE PAGAMENTO
//         </button>
//       </div>
//     </main>
//   );
// }