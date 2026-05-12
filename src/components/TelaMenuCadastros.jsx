import React from 'react';

// ÍCONES SVG
const IconBox = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>;
const IconTruck = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>;
const IconTag = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>;
const IconCreditCard = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>;
const IconUser = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const IconUsers = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;


export default function TelaMenuCadastros({ setSubTela, perfil }) {
  const isAdm = perfil?.tipo === 'adm';

  return (
    <main className="tela">
      <h2 style={{ color: '#4b5563', marginBottom: '10px' }}>CADASTROS E AJUSTES</h2>
      
      <div className="form-padrao" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        
        {(isAdm || perfil?.perm_produtos) && (
          <button className="btn-secundario" onClick={() => setSubTela('produtos')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: 0 }}>
            <IconBox /> PRODUTOS
          </button>
        )}
        
        {(isAdm || perfil?.perm_fornecedores) && (
          <button className="btn-secundario" onClick={() => setSubTela('fornecedores')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: 0 }}>
            <IconTruck /> FORNECEDORES
          </button>
        )}

        {(isAdm || perfil?.perm_categorias) && (
          <button className="btn-secundario" onClick={() => setSubTela('categorias')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: 0 }}>
            <IconTag /> CATEGORIAS
          </button>
        )}
        
        {(isAdm || perfil?.perm_pagamentos) && (
          <button className="btn-secundario" onClick={() => setSubTela('pagamentos')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: 0 }}>
            <IconCreditCard /> FORMAS DE PAGAMENTO
          </button>
        )}
        
        <button className="btn-secundario" onClick={() => setSubTela('perfil')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: 0 }}>
          <IconUser /> MEU PERFIL
        </button>
        
        {isAdm && (
          <button className="btn-secundario" onClick={() => setSubTela('usuarios')} style={{ border: '1px solid #4f46e5', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: 0, marginTop: '10px' }}>
            <IconUsers /> GESTÃO DE FUNCIONÁRIOS
          </button>
        )}

      </div>
    </main>
  );
}









// import React from 'react';

// export default function TelaMenuCadastros({ setSubTela, perfil }) {
//   return (
//     <main className="tela">
//       <h2>CADASTROS E AJUSTES</h2>
//       <div className="form-padrao" style={{ marginTop: '20px' }}>
//         <button className="btn-secundario" onClick={() => setSubTela('produtos')}>📦 PRODUTOS</button>
//         <button className="btn-secundario" onClick={() => setSubTela('fornecedores')}>🚚 FORNECEDORES</button>
//         <button className="btn-secundario" onClick={() => setSubTela('categorias')}>🏷️ CATEGORIAS</button>
        
//         {/* NOVO BOTÃO DE FORMAS DE PAGAMENTO */}
//         <button className="btn-secundario" onClick={() => setSubTela('pagamentos')}>💳 FORMAS DE PAGAMENTO</button>
        
//         <button className="btn-secundario" onClick={() => setSubTela('perfil')}>👤 MEU PERFIL</button>
        
//         {perfil?.tipo === 'adm' && (
//           <button className="btn-secundario" onClick={() => setSubTela('usuarios')} style={{ border: '1px solid #4f46e5', color: '#4f46e5' }}>
//             👥 GESTÃO DE FUNCIONÁRIOS
//           </button>
//         )}
//       </div>
//     </main>
//   );
// }