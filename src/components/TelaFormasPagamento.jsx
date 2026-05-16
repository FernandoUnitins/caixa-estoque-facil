import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// ==========================================
// ÍCONES SVG COM CORES FORÇADAS
// ==========================================
const IconCreditCard = ({ color = "currentColor", size = "24" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
    <line x1="1" y1="10" x2="23" y2="10"></line>
  </svg>
);

const IconPlus = ({ color = "currentColor", size = "20" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const IconAlertTriangle = ({ color = "currentColor", size = "24" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

// Componente de Fundo Escuro para o Modal
const Overlay = ({ children }) => (
  <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    {children}
  </div>
);

export default function TelaFormasPagamento({ mostrarToast }) {
  const [formas, setFormas] = useState([]);
  const [telaAtual, setTelaAtual] = useState('lista'); // 'lista' ou 'form'
  const [loading, setLoading] = useState(false);
  const [modalConfirmacao, setModalConfirmacao] = useState(false);

  // Estado unificado para o formulário
  const [form, setForm] = useState({ id: null, nome: '', ativo: true });

  // Carrega as formas de pagamento sempre que a tela voltar para 'lista'
  useEffect(() => {
    if (telaAtual === 'lista') carregarFormas();
  }, [telaAtual]);

  const carregarFormas = async () => {
    const { data, error } = await supabase.from('formas_pagamento').select('*').order('nome');
    if (data) setFormas(data);
    if (error) mostrarToast('Erro ao buscar formas de pagamento.', 'erro');
  };

  const abrirFormulario = (forma = null) => {
    if (forma) {
      setForm({ ...forma }); // MODO EDIÇÃO
    } else {
      setForm({ id: null, nome: '', ativo: true }); // MODO CADASTRO
    }
    setTelaAtual('form');
  };

  const salvarForma = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Garante que o nome seja salvo em maiúsculo e sem espaços inúteis nas pontas
    const nomeMaiusculo = form.nome.toUpperCase().trim();

    if (form.id) {
      // MODO EDIÇÃO (UPDATE)
      const { error } = await supabase.from('formas_pagamento')
        .update({ nome: nomeMaiusculo, ativo: form.ativo })
        .eq('id', form.id);

      if (error) {
        mostrarToast('Erro ao atualizar a forma de pagamento.', 'erro');
      } else {
        mostrarToast('Forma de pagamento atualizada com sucesso!', 'sucesso');
        setTelaAtual('lista');
      }
    } else {
      // MODO CADASTRO (INSERT)
      const { error } = await supabase.from('formas_pagamento')
        .insert([{ nome: nomeMaiusculo }]);

      if (error) {
        mostrarToast('Erro ao cadastrar forma de pagamento.', 'erro');
      } else {
        mostrarToast('Forma de pagamento cadastrada com sucesso!', 'sucesso');
        setTelaAtual('lista');
      }
    }
    setLoading(false);
  };

  // Função para interceptar o clique no checkbox de desativar
  const handleToggleAtivo = (e) => {
    const isChecked = e.target.checked;
    if (!isChecked) {
      // O usuário tentou desmarcar (desativar) -> Abre o Modal
      setModalConfirmacao(true);
    } else {
      // O usuário está ativando -> Pode marcar direto
      setForm({ ...form, ativo: true });
    }
  };

  // ==========================================
  // RENDERIZAÇÃO DO MODO: FORMULÁRIO
  // ==========================================
  if (telaAtual === 'form') {
    return (
      <main className="tela" style={{ paddingBottom: '30px', width: '100%', overflowX: 'hidden' }}>
        
        {/* MODAL DE CONFIRMAÇÃO DE DESATIVAÇÃO */}
        {modalConfirmacao && (
          <Overlay>
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '20px', width: '90%', maxWidth: '350px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
                <IconAlertTriangle color="#ef4444" size="48" />
              </div>
              <h3 style={{ color: '#374151', marginBottom: '10px' }}>Desativar Pagamento?</h3>
              <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '25px' }}>
                Tem a certeza que deseja desativar? <br/>Esta opção não aparecerá mais para o operador de caixa na hora de finalizar as vendas.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setModalConfirmacao(false)} className="btn-secundario" style={{ flex: 1, margin: 0 }}>CANCELAR</button>
                <button 
                  type="button" 
                  onClick={() => { setForm({ ...form, ativo: false }); setModalConfirmacao(false); }} 
                  className="btn-entrada" 
                  style={{ flex: 1, margin: 0, backgroundColor: '#ef4444' }}
                >
                  SIM, DESATIVAR
                </button>
              </div>
            </div>
          </Overlay>
        )}

        <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#4b5563' }}>
          <IconCreditCard /> {form.id ? 'EDITAR FORMA DE PAGAMENTO' : 'NOVA FORMA DE PAGAMENTO'}
        </h2>
        
        <form onSubmit={salvarForma} className="form-padrao" style={{ marginTop: '20px' }}>
          
          <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#4b5563', paddingLeft: '4px' }}>NOME DA FORMA DE PAGAMENTO</label>
          <input 
            type="text" 
            placeholder="EX: PIX, DINHEIRO, CARTÃO CRÉDITO" 
            value={form.nome} 
            onChange={(e) => setForm({ ...form, nome: e.target.value.toUpperCase() })} 
            className="input-padrao" 
            required
          />

          {/* Só mostra a opção de desativar se estiver editando uma existente */}
          {form.id && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', padding: '10px', backgroundColor: form.ativo ? '#ecfdf5' : '#fef2f2', borderRadius: '12px', border: `1px solid ${form.ativo ? '#10b981' : '#ef4444'}` }}>
              <input 
                type="checkbox" 
                checked={form.ativo} 
                onChange={handleToggleAtivo} 
                id="chkAtivoPagamento" 
                style={{ transform: 'scale(1.5)', marginLeft: '10px' }} 
              />
              <label htmlFor="chkAtivoPagamento" style={{ fontWeight: '700', color: form.ativo ? '#10b981' : '#ef4444', cursor: 'pointer' }}>
                {form.ativo ? 'FORMA DE PAGAMENTO ATIVA' : 'FORMA DE PAGAMENTO INATIVA'}
              </label>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn-secundario" onClick={() => setTelaAtual('lista')} style={{ flex: 1, margin: 0 }}>
              CANCELAR
            </button>
            <button type="submit" className="btn-entrada" disabled={loading} style={{ flex: 1, margin: 0 }}>
              {loading ? 'SALVANDO...' : 'SALVAR'}
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
        <IconCreditCard /> FORMAS DE PAGAMENTO
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
        
        {formas.length === 0 && (
          <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.9rem', margin: '20px 0' }}>
            Nenhuma forma de pagamento cadastrada.
          </p>
        )}

        {formas.map(f => (
          <div 
            key={f.id} 
            onClick={() => abrirFormulario(f)}
            style={{ 
              backgroundColor: '#f9fafb', 
              padding: '15px', 
              borderRadius: '12px', 
              border: '1px solid #e5e7eb', 
              cursor: 'pointer', 
              opacity: f.ativo ? 1 : 0.6,
              transition: 'background-color 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ color: '#374151', fontSize: '1.05rem' }}>{f.nome}</strong>
              <span style={{ 
                fontSize: '0.7rem', 
                backgroundColor: f.ativo ? '#ecfdf5' : '#fef2f2', 
                color: f.ativo ? '#10b981' : '#ef4444', 
                padding: '4px 8px', 
                borderRadius: '6px', 
                fontWeight: 'bold' 
              }}>
                {f.ativo ? 'ATIVA' : 'INATIVA'}
              </span>
            </div>
          </div>
        ))}

        <button 
          className="btn-entrada" 
          onClick={() => abrirFormulario()} 
          style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <IconPlus /> NOVA FORMA DE PAGAMENTO
        </button>
      </div>
    </main>
  );
}