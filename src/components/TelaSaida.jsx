import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// ==========================================
// ÍCONES SVG COM CORES FORÇADAS
// ==========================================
const IconUpload = ({ color = "currentColor", size = "24" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

export default function TelaSaida({ setTelaAtual, mostrarToast }) {
  const [form, setForm] = useState({ descricao: '', valor: '', observacao: '', forma_pagamento: '' });
  const [formasPagamento, setFormasPagamento] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from('formas_pagamento').select('nome').eq('ativo', true).then(({ data }) => setFormasPagamento(data || []));
  }, []);

  // ==========================================
  // FUNÇÕES DE MÁSCARA E CÁLCULO
  // ==========================================
  const mascaraMoeda = (valor) => {
    if (valor === '' || valor === undefined || valor === null) return '';
    let v = String(valor).replace(/\D/g, ""); 
    if (v === '') return '';
    return (Number(v) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const parseMoeda = (valor) => {
    if (!valor) return 0;
    const cleanString = String(valor).replace(/[^\d,]/g, '');
    return parseFloat(cleanString.replace(',', '.')) || 0;
  };

  const salvar = async (e) => {
    e.preventDefault();
    setLoading(true);

    const valorFormatado = parseMoeda(form.valor);

    if (valorFormatado <= 0) {
      mostrarToast('O valor da despesa deve ser maior que zero.', 'erro');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('lancamentos').insert([{
      tipo: 'SAIDA', 
      descricao: form.descricao.trim().toUpperCase(), // Força maiúsculo ao salvar
      valor: valorFormatado, 
      observacao: form.observacao, 
      forma_pagamento: form.forma_pagamento
    }]);

    if (error) {
      mostrarToast('Erro ao registrar saída.', 'erro');
    } else {
      mostrarToast('Despesa registrada com sucesso!', 'sucesso');
      setTelaAtual('resumo');
    }
    
    setLoading(false);
  };

  const LabelCampo = ({ children }) => (
    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4b5563', paddingLeft: '4px' }}>
      {children}
    </label>
  );

// Substitua o retorno (return) da sua TelaSaida por este:
return (
  <main className="tela">
    <h2 style={{ color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
      <IconUpload color="#ef4444" /> REGISTRAR SAÍDA
    </h2>

    <form onSubmit={salvar} className="form-padrao" style={{ marginTop: '20px' }}>
      <LabelCampo>Descrição da Despesa</LabelCampo>
      <textarea 
        placeholder="EX: CONTA DE LUZ, PAGAMENTO DE FORNECEDOR" 
        className="input-padrao" 
        rows="3" 
        required 
        value={form.descricao}
        onChange={e => setForm({...form, descricao: e.target.value.toUpperCase()})} 
      />

      <LabelCampo>Valor (R$)</LabelCampo>
      <input 
        type="text" 
        className="input-padrao" 
        required 
        value={form.valor}
        onChange={e => setForm({...form, valor: mascaraMoeda(e.target.value)})} 
      />

      {/* Select e Botões seguem o mesmo padrão fluido */}
      <button type="submit" className="btn-entrada" disabled={loading}>
        {loading ? 'SALVANDO...' : 'SALVAR DESPESA'}
      </button>
      <button type="button" className="btn-secundario" onClick={() => setTelaAtual('resumo')}>
        CANCELAR
      </button>
    </form>
  </main>
);

}