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

  return (
    <main className="tela" style={{ paddingBottom: '30px' }}>
      <h2 style={{ color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <IconUpload color="#ef4444" /> REGISTRAR SAÍDA (DESPESA)
      </h2>

      <form onSubmit={salvar} className="form-padrao" style={{ marginTop: '20px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <LabelCampo>Descrição da Despesa</LabelCampo>
          {/* O textarea permite quebra de linha e já transforma em maiúsculo na digitação */}
          <textarea 
            placeholder="EX: CONTA DE LUZ, PAGAMENTO DE FORNECEDOR" 
            className="input-padrao" 
            rows="2" 
            style={{ resize: 'vertical' }}
            required 
            value={form.descricao}
            onChange={e => setForm({...form, descricao: e.target.value.toUpperCase()})} 
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <LabelCampo>Valor (R$)</LabelCampo>
          {/* Campo de valor com máscara visual do Real */}
          <input 
            type="text" 
            placeholder="0,00" 
            className="input-padrao" 
            required 
            value={form.valor}
            onChange={e => setForm({...form, valor: mascaraMoeda(e.target.value)})} 
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <LabelCampo>Forma de Pagamento</LabelCampo>
          <select 
            className="input-padrao" 
            required 
            value={form.forma_pagamento}
            onChange={e => setForm({...form, forma_pagamento: e.target.value})}
          >
            <option value="">Selecione...</option>
            {formasPagamento.map(f => <option key={f.nome} value={f.nome}>{f.nome}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <LabelCampo>Observação (Opcional)</LabelCampo>
          <textarea 
            placeholder="Detalhes adicionais..." 
            className="input-padrao" 
            rows="2" 
            style={{ resize: 'vertical' }}
            value={form.observacao}
            onChange={e => setForm({...form, observacao: e.target.value})} 
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
          {/* Botão verde de Salvar */}
          <button type="submit" className="btn-entrada" disabled={loading} style={{ margin: 0, height: '55px', fontSize: '1.1rem' }}>
            {loading ? 'SALVANDO...' : 'SALVAR DESPESA'}
          </button>
          
          {/* Botão Cancelar (Abaixo do Salvar) */}
          <button type="button" className="btn-secundario" onClick={() => setTelaAtual('resumo')} style={{ margin: 0, height: '55px' }}>
            CANCELAR
          </button>
        </div>

      </form>
    </main>
  );
}