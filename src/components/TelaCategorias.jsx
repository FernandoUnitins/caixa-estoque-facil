import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// ==========================================
// ÍCONES SVG COM CORES FORÇADAS
// ==========================================
const IconTag = ({ color = "currentColor" }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
    <line x1="7" y1="7" x2="7.01" y2="7"></line>
  </svg>
);

const IconPlus = ({ color = "currentColor" }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export default function TelaCategorias({ mostrarToast }) {
  const [categorias, setCategorias] = useState([]);
  const [telaAtual, setTelaAtual] = useState('lista'); // 'lista' ou 'form'
  const [loading, setLoading] = useState(false);

  // Estado unificado para o formulário
  const [form, setForm] = useState({ id: null, nome: '', observacao: '', ativo: true });

  // Carrega as categorias sempre que a tela voltar para 'lista'
  useEffect(() => {
    if (telaAtual === 'lista') carregarCategorias();
  }, [telaAtual]);

  const carregarCategorias = async () => {
    const { data, error } = await supabase.from('categorias').select('*').order('nome');
    if (data) setCategorias(data);
    if (error) mostrarToast('Erro ao buscar categorias.', 'erro');
  };

  const abrirFormulario = (categoria = null) => {
    if (categoria) {
      setForm({ ...categoria }); // MODO EDIÇÃO
    } else {
      setForm({ id: null, nome: '', observacao: '', ativo: true }); // MODO CADASTRO
    }
    setTelaAtual('form');
  };

  const salvarCategoria = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Garante que o nome seja guardado em maiúsculas e sem espaços inúteis nas pontas
    const nomeMaiusculo = form.nome.toUpperCase().trim();

    if (form.id) {
      // MODO EDIÇÃO (UPDATE)
      const { error } = await supabase.from('categorias')
        .update({ nome: nomeMaiusculo, observacao: form.observacao, ativo: form.ativo })
        .eq('id', form.id);

      if (error) {
        mostrarToast('Erro ao atualizar a categoria.', 'erro');
      } else {
        mostrarToast('Categoria atualizada com sucesso!', 'sucesso');
        setTelaAtual('lista');
      }
    } else {
      // MODO CADASTRO (INSERT)
      const { error } = await supabase.from('categorias')
        .insert([{ nome: nomeMaiusculo, observacao: form.observacao }]);

      if (error) {
        mostrarToast('Erro ao cadastrar categoria.', 'erro');
      } else {
        mostrarToast('Categoria cadastrada com sucesso!', 'sucesso');
        setTelaAtual('lista');
      }
    }
    setLoading(false);
  };

  // ==========================================
  // RENDERIZAÇÃO DO MODO: FORMULÁRIO
  // ==========================================
  if (telaAtual === 'form') {
    return (
      <main className="tela" style={{ paddingBottom: '30px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#4b5563' }}>
          <IconTag /> {form.id ? 'EDITAR CATEGORIA' : 'NOVA CATEGORIA'}
        </h2>
        
        <form onSubmit={salvarCategoria} className="form-padrao" style={{ marginTop: '20px' }}>
          
          <input 
            type="text" 
            placeholder="NOME DA CATEGORIA (EX: BEBIDAS)" 
            value={form.nome} 
            onChange={(e) => setForm({ ...form, nome: e.target.value.toUpperCase() })} 
            className="input-padrao" 
            required
          />
          
          <textarea 
            placeholder="Observação (opcional)" 
            value={form.observacao || ''} 
            onChange={(e) => setForm({ ...form, observacao: e.target.value })} 
            className="input-padrao"
            rows="3"
          />

          {/* Só mostra a opção de desativar se estiver a editar uma categoria existente */}
          {form.id && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
              <input 
                type="checkbox" 
                checked={form.ativo} 
                onChange={(e) => setForm({ ...form, ativo: e.target.checked })} 
                id="chkAtivoCategoria" 
                style={{ transform: 'scale(1.5)' }} 
              />
              <label htmlFor="chkAtivoCategoria" style={{ fontWeight: '600', color: form.ativo ? '#10b981' : '#ef4444', cursor: 'pointer' }}>
                {form.ativo ? 'CATEGORIA ATIVA' : 'CATEGORIA INATIVA'}
              </label>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button type="button" className="btn-secundario" onClick={() => setTelaAtual('lista')} style={{ flex: 1, margin: 0 }}>
              CANCELAR
            </button>
            <button type="submit" className="btn-entrada" disabled={loading} style={{ flex: 1, margin: 0 }}>
              {loading ? 'A GUARDAR...' : 'SALVAR'}
            </button>
          </div>

        </form>
      </main>
    );
  }

  // ==========================================
  // RENDERIZAÇÃO DO MODO: LISTAGEM
  // ==========================================
  return (
    <main className="tela" style={{ paddingBottom: '30px' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#4b5563' }}>
        <IconTag /> CATEGORIAS
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
        
        {categorias.length === 0 && (
          <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.9rem', margin: '20px 0' }}>
            Nenhuma categoria cadastrada.
          </p>
        )}

        {categorias.map(cat => (
          <div 
            key={cat.id} 
            onClick={() => abrirFormulario(cat)}
            style={{ 
              backgroundColor: '#f9fafb', 
              padding: '15px', 
              borderRadius: '12px', 
              border: '1px solid #e5e7eb', 
              cursor: 'pointer', 
              opacity: cat.ativo ? 1 : 0.6,
              transition: 'background-color 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ color: '#374151' }}>{cat.nome}</strong>
              <span style={{ 
                fontSize: '0.7rem', 
                backgroundColor: cat.ativo ? '#ecfdf5' : '#fef2f2', 
                color: cat.ativo ? '#10b981' : '#ef4444', 
                padding: '4px 8px', 
                borderRadius: '6px', 
                fontWeight: 'bold' 
              }}>
                {cat.ativo ? 'ATIVA' : 'INATIVA'}
              </span>
            </div>
            {cat.observacao && (
              <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '5px' }}>{cat.observacao}</p>
            )}
          </div>
        ))}

        <button 
          className="btn-entrada" 
          onClick={() => abrirFormulario()} 
          style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <IconPlus /> NOVA CATEGORIA
        </button>
      </div>
    </main>
  );
}