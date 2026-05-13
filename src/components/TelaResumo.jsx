import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// ==========================================
// ÍCONES SVG MODERNOS (Estilo Financeiro)
// ==========================================
const IconList = ({ color = "currentColor", size = "24" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>;
const IconCalendar = ({ color = "currentColor", size = "20" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const IconArrowLeft = ({ color = "currentColor", size = "20" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const IconClose = ({ color = "currentColor", size = "24" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const IconReceipt = ({ color = "currentColor", size = "24" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>;

// Novos Ícones para o Resumo
const IconTrendingUp = ({ color = "currentColor", size = "20" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>;
const IconTrendingDown = ({ color = "currentColor", size = "20" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>;
const IconWallet = ({ color = "currentColor", size = "24" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>;

export default function TelaResumo() {
  const [telaAtual, setTelaAtual] = useState('resumo'); // 'resumo' ou 'historico'
  
  // Estados para o Resumo do Dia
  const [entradas, setEntradas] = useState(0);
  const [saidas, setSaidas] = useState(0);
  const [loading, setLoading] = useState(false);

  // Estados para o Histórico Filtrado
  const dataHoje = new Date().toLocaleDateString('en-CA'); // Pega 'YYYY-MM-DD'
  const [dataFiltro, setDataFiltro] = useState(dataHoje);
  const [lancamentos, setLancamentos] = useState([]);
  
  // Estados para o Modal de Detalhes
  const [modalDetalhes, setModalDetalhes] = useState(null);
  const [itensDetalhe, setItensDetalhe] = useState([]);
  const [buscandoItens, setBuscandoItens] = useState(false);

  useEffect(() => {
    if (telaAtual === 'resumo') {
      carregarResumoHoje();
    } else {
      carregarHistorico(dataFiltro);
    }
  }, [telaAtual, dataFiltro]);

  // ==========================================
  // BUSCA DADOS DO DIA (TELA INICIAL)
  // ==========================================
  async function carregarResumoHoje() {
    setLoading(true);
    const start = new Date(`${dataHoje}T00:00:00-03:00`).toISOString();
    const end = new Date(`${dataHoje}T23:59:59.999-03:00`).toISOString();

    const { data, error } = await supabase
      .from('lancamentos')
      .select('tipo, valor')
      .gte('data_hora', start)
      .lte('data_hora', end);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    let totalEntradas = 0;
    let totalSaidas = 0;

    data.forEach(lanc => {
      if (lanc.tipo === 'ENTRADA' || lanc.tipo === 'REFORCO') totalEntradas += Number(lanc.valor);
      if (lanc.tipo === 'SAIDA' || lanc.tipo === 'SANGRIA') totalSaidas += Number(lanc.valor);
    });

    setEntradas(totalEntradas);
    setSaidas(totalSaidas);
    setLoading(false);
  }

  // ==========================================
  // BUSCA DADOS DO HISTÓRICO (FILTRO POR DATA)
  // ==========================================
  async function carregarHistorico(dataEscolhida) {
    setLoading(true);
    const start = new Date(`${dataEscolhida}T00:00:00-03:00`).toISOString();
    const end = new Date(`${dataEscolhida}T23:59:59.999-03:00`).toISOString();

    const { data, error } = await supabase
      .from('lancamentos')
      .select('*')
      .gte('data_hora', start)
      .lte('data_hora', end)
      .order('data_hora', { ascending: false });

    if (!error && data) setLancamentos(data);
    setLoading(false);
  }

  // ==========================================
  // BUSCA ITENS DA VENDA PARA O MODAL
  // ==========================================
  async function abrirDetalhes(lanc) {
    setModalDetalhes(lanc);
    setItensDetalhe([]);
    
    if (lanc.tipo === 'ENTRADA') {
      setBuscandoItens(true);
      const { data, error } = await supabase
        .from('itens_venda')
        .select(`
          quantidade, preco_unitario, desconto, subtotal,
          produtos (descricao)
        `)
        .eq('lancamento_id', lanc.id);
        
      if (!error && data) setItensDetalhe(data);
      setBuscandoItens(false);
    }
  }

  const formatarMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatarHora = (dataString) => new Date(dataString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const saldoHoje = entradas - saidas;

  // Calculos do Filtro Ativo
  const totalEntradasFiltro = lancamentos.filter(l => l.tipo === 'ENTRADA' || l.tipo === 'REFORCO').reduce((acc, curr) => acc + Number(curr.valor), 0);
  const totalSaidasFiltro = lancamentos.filter(l => l.tipo === 'SAIDA' || l.tipo === 'SANGRIA').reduce((acc, curr) => acc + Number(curr.valor), 0);

  const Overlay = ({ children }) => <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{children}</div>;

  // ==========================================
  // VISUALIZAÇÃO: TELA DE HISTÓRICO
  // ==========================================
  if (telaAtual === 'historico') {
    return (
      <main className="tela" style={{ paddingBottom: '30px' }}>
        
        {/* MODAL DE DETALHES DO LANÇAMENTO */}
        {modalDetalhes && (
          <Overlay>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '16px', width: '90%', maxWidth: '400px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                <h3 style={{ color: '#374151', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IconReceipt color="#4f46e5" /> Detalhes
                </h3>
                <button onClick={() => setModalDetalhes(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <IconClose color="#9ca3af" />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Data/Hora:</span>
                  <strong style={{ color: '#374151', fontSize: '0.85rem' }}>{new Date(modalDetalhes.data_hora).toLocaleString('pt-BR')}</strong>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Tipo:</span>
                  <strong style={{ color: modalDetalhes.tipo === 'ENTRADA' ? '#10b981' : '#ef4444', fontSize: '0.85rem' }}>
                    {modalDetalhes.tipo}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Pagamento:</span>
                  <strong style={{ color: '#374151', fontSize: '0.85rem' }}>{modalDetalhes.forma_pagamento || 'Não info.'}</strong>
                </div>

                {modalDetalhes.descricao && (
                  <div style={{ marginBottom: '15px', backgroundColor: '#f9fafb', padding: '10px', borderRadius: '8px' }}>
                    <span style={{ color: '#6b7280', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Descrição / Origem:</span>
                    <strong style={{ color: '#374151', fontSize: '0.9rem' }}>{modalDetalhes.descricao}</strong>
                  </div>
                )}

                {/* SESSÃO DE ITENS VENDIDOS */}
                {modalDetalhes.tipo === 'ENTRADA' && (
                  <div style={{ marginTop: '20px' }}>
                    <h4 style={{ fontSize: '0.9rem', color: '#4b5563', borderBottom: '1px solid #e5e7eb', paddingBottom: '5px', marginBottom: '10px' }}>PRODUTOS DA VENDA</h4>
                    
                    {buscandoItens ? (
                      <p style={{ fontSize: '0.8rem', color: '#6b7280', textAlign: 'center' }}>Carregando produtos...</p>
                    ) : itensDetalhe.length === 0 ? (
                      <p style={{ fontSize: '0.8rem', color: '#9ca3af', textAlign: 'center' }}>Venda sem produtos avulsos ou lançamento manual antigo.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {itensDetalhe.map((item, i) => (
                          <div key={i} style={{ backgroundColor: '#f3f4f6', padding: '10px', borderRadius: '8px', fontSize: '0.85rem' }}>
                            <strong style={{ display: 'block', color: '#374151', marginBottom: '4px' }}>{item.produtos?.descricao || 'Produto Removido'}</strong>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#6b7280' }}>{item.quantidade}x {formatarMoeda(item.preco_unitario)}</span>
                              <strong style={{ color: '#10b981' }}>{formatarMoeda(item.subtotal)}</strong>
                            </div>
                            {item.desconto > 0 && <span style={{ display: 'block', color: '#ef4444', fontSize: '0.75rem', marginTop: '2px' }}>Desc: -{formatarMoeda(item.desconto)}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* TOTAIS DO MODAL */}
              <div style={{ marginTop: '20px', backgroundColor: modalDetalhes.tipo === 'ENTRADA' ? '#ecfdf5' : '#fef2f2', padding: '15px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Valor Bruto:</span>
                  <strong style={{ color: '#374151' }}>{formatarMoeda(Number(modalDetalhes.valor) + Number(modalDetalhes.desconto || 0))}</strong>
                </div>
                {modalDetalhes.desconto > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ color: '#ef4444', fontSize: '0.85rem' }}>Desconto Global:</span>
                    <strong style={{ color: '#ef4444' }}>-{formatarMoeda(modalDetalhes.desconto)}</strong>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '10px' }}>
                  <strong style={{ color: '#374151', fontSize: '1rem' }}>TOTAL {modalDetalhes.tipo}:</strong>
                  <strong style={{ color: modalDetalhes.tipo === 'ENTRADA' ? '#10b981' : '#ef4444', fontSize: '1.2rem' }}>
                    {formatarMoeda(modalDetalhes.valor)}
                  </strong>
                </div>
                
                {modalDetalhes.troco > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                    <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>Dinheiro Recebido: {formatarMoeda(modalDetalhes.valor_recebido)}</span>
                    <strong style={{ color: '#4f46e5', fontSize: '0.85rem' }}>Troco: {formatarMoeda(modalDetalhes.troco)}</strong>
                  </div>
                )}
              </div>
              
              <button onClick={() => setModalDetalhes(null)} className="btn-secundario" style={{ margin: '15px 0 0 0' }}>FECHAR</button>
            </div>
          </Overlay>
        )}

        {/* CABEÇALHO DO HISTÓRICO */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <button onClick={() => setTelaAtual('resumo')} style={{ background: 'transparent', border: 'none', color: '#4f46e5', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
            <IconArrowLeft /> VOLTAR
          </button>
          <h2 style={{ fontSize: '1.1rem', margin: 0, color: '#374151' }}>HISTÓRICO</h2>
        </div>

        {/* FILTRO DE DATA */}
        <div style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '20px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <IconCalendar size="16" /> Escolha a Data
          </label>
          <input 
            type="date" 
            value={dataFiltro} 
            onChange={(e) => setDataFiltro(e.target.value)} 
            className="input-padrao" 
            style={{ margin: 0 }}
          />
        </div>

        {/* RESUMO DO FILTRO */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          <div style={{ backgroundColor: '#ecfdf5', padding: '15px', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
            <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 'bold' }}>ENTRADAS</span>
            <strong style={{ display: 'block', fontSize: '1.1rem', color: '#10b981', marginTop: '5px' }}>{formatarMoeda(totalEntradasFiltro)}</strong>
          </div>
          <div style={{ backgroundColor: '#fef2f2', padding: '15px', borderRadius: '12px', border: '1px solid #fecaca' }}>
            <span style={{ fontSize: '0.75rem', color: '#b91c1c', fontWeight: 'bold' }}>SAÍDAS</span>
            <strong style={{ display: 'block', fontSize: '1.1rem', color: '#ef4444', marginTop: '5px' }}>{formatarMoeda(totalSaidasFiltro)}</strong>
          </div>
        </div>

        {/* LISTA DE LANÇAMENTOS */}
        {loading ? (
          <p style={{ textAlign: 'center', color: '#6b7280' }}>Carregando...</p>
        ) : lancamentos.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#9ca3af', marginTop: '30px' }}>Nenhum lançamento encontrado nesta data.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3 style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '5px' }}>Transações:</h3>
            {lancamentos.map(lanc => (
              <div 
                key={lanc.id} 
                onClick={() => abrirDetalhes(lanc)}
                style={{ 
                  backgroundColor: 'white', padding: '15px', borderRadius: '12px', border: '1px solid #e5e7eb', 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ flex: 1, minWidth: 0, paddingRight: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.7rem', backgroundColor: (lanc.tipo === 'ENTRADA' || lanc.tipo === 'REFORCO') ? '#ecfdf5' : '#fef2f2', color: (lanc.tipo === 'ENTRADA' || lanc.tipo === 'REFORCO') ? '#10b981' : '#ef4444', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                      {lanc.tipo}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{formatarHora(lanc.data_hora)}</span>
                  </div>
                  <strong style={{ display: 'block', fontSize: '0.9rem', color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {lanc.descricao}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{lanc.forma_pagamento || 'N/A'}</span>
                </div>
                <strong style={{ color: (lanc.tipo === 'ENTRADA' || lanc.tipo === 'REFORCO') ? '#10b981' : '#ef4444', fontSize: '1.1rem', flexShrink: 0 }}>
                  {(lanc.tipo === 'ENTRADA' || lanc.tipo === 'REFORCO') ? '+' : '-'}{formatarMoeda(lanc.valor)}
                </strong>
              </div>
            ))}
          </div>
        )}
      </main>
    );
  }

  // ==========================================
  // VISUALIZAÇÃO: TELA RESUMO (INICIAL PADRÃO)
  // ==========================================
  return (
    <main className="tela" style={{ display: 'flex', flexDirection: 'column' }}>
      
      {/* CABEÇALHO MODERNO */}
      <header style={{ marginBottom: '25px', textAlign: 'center' }}>
        <h2 style={{ color: '#374151', fontSize: '1.4rem', margin: '0 0 5px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          RESUMO DO CAIXA
        </h2>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#f3f4f6', padding: '4px 12px', borderRadius: '20px', color: '#6b7280', fontSize: '0.85rem', fontWeight: '600' }}>
          <IconCalendar size="14" /> HOJE • {new Date().toLocaleDateString('pt-BR')}
        </div>
      </header>
      
      {loading ? (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#9ca3af' }}>Atualizando...</div>
      ) : (
        <div className="resumo-box" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          {/* CARDS DE ENTRADAS E SAÍDAS (LADO A LADO) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            
            {/* Card Entrada */}
            <div style={{ backgroundColor: '#ecfdf5', padding: '20px 15px', borderRadius: '16px', border: '1px solid #a7f3d0', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.05)' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#047857' }}>
                  <IconTrendingUp size="18" /> 
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>ENTRADAS</span>
               </div>
               <strong style={{ fontSize: '1.4rem', color: '#10b981' }}>{formatarMoeda(entradas)}</strong>
            </div>

            {/* Card Saída */}
            <div style={{ backgroundColor: '#fef2f2', padding: '20px 15px', borderRadius: '16px', border: '1px solid #fecaca', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 4px 6px rgba(239, 68, 68, 0.05)' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#b91c1c' }}>
                  <IconTrendingDown size="18" /> 
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>SAÍDAS</span>
               </div>
               <strong style={{ fontSize: '1.4rem', color: '#ef4444' }}>{formatarMoeda(saidas)}</strong>
            </div>

          </div>
          
          {/* CARD DE SALDO PRINCIPAL */}
          <div style={{ 
            backgroundColor: saldoHoje >= 0 ? '#4f46e5' : '#ef4444', 
            padding: '25px 20px', 
            borderRadius: '16px', 
            color: 'white', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '10px', 
            boxShadow: saldoHoje >= 0 ? '0 10px 20px rgba(79, 70, 229, 0.2)' : '0 10px 20px rgba(239, 68, 68, 0.2)',
            marginBottom: '10px',
            transition: 'all 0.3s ease'
          }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.9 }}>
                <IconWallet size="22" /> 
                <span style={{ fontSize: '0.9rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Saldo Líquido do Dia</span>
             </div>
             <strong style={{ fontSize: '2.4rem', fontWeight: '800', margin: '5px 0' }}>
               {formatarMoeda(saldoHoje)}
             </strong>
          </div>

        </div>
      )}

      {/* BOTÃO DE NAVEGAÇÃO */}
      <div style={{ marginTop: '25px', paddingBottom: '10px' }}>
        <button 
          className="btn-secundario" 
          onClick={() => setTelaAtual('historico')}
          style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', fontSize: '1.05rem', color: '#4f46e5', border: '2px solid #eef2ff', backgroundColor: '#eef2ff' }}
        >
          <IconList /> VER HISTÓRICO DE LANÇAMENTOS
        </button>
      </div>
    </main>
  );
}









// import React, { useState, useEffect } from 'react';
// import { supabase } from '../supabaseClient';

// // ==========================================
// // ÍCONES SVG COM CORES FORÇADAS
// // ==========================================
// const IconList = ({ color = "currentColor", size = "24" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>;
// const IconCalendar = ({ color = "currentColor", size = "20" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
// const IconArrowLeft = ({ color = "currentColor", size = "20" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
// const IconClose = ({ color = "currentColor", size = "24" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
// const IconReceipt = ({ color = "currentColor", size = "24" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>;

// export default function TelaResumo() {
//   const [telaAtual, setTelaAtual] = useState('resumo'); // 'resumo' ou 'historico'
  
//   // Estados para o Resumo do Dia
//   const [entradas, setEntradas] = useState(0);
//   const [saidas, setSaidas] = useState(0);
//   const [loading, setLoading] = useState(false);

//   // Estados para o Histórico Filtrado
//   const dataHoje = new Date().toLocaleDateString('en-CA'); // Pega 'YYYY-MM-DD'
//   const [dataFiltro, setDataFiltro] = useState(dataHoje);
//   const [lancamentos, setLancamentos] = useState([]);
  
//   // Estados para o Modal de Detalhes
//   const [modalDetalhes, setModalDetalhes] = useState(null);
//   const [itensDetalhe, setItensDetalhe] = useState([]);
//   const [buscandoItens, setBuscandoItens] = useState(false);

//   useEffect(() => {
//     if (telaAtual === 'resumo') {
//       carregarResumoHoje();
//     } else {
//       carregarHistorico(dataFiltro);
//     }
//   }, [telaAtual, dataFiltro]);

//   // ==========================================
//   // BUSCA DADOS DO DIA (TELA INICIAL)
//   // ==========================================
//   async function carregarResumoHoje() {
//     setLoading(true);
//     // Converte a data de hoje para Início e Fim do dia no fuso do Brasil (-03:00)
//     const start = new Date(`${dataHoje}T00:00:00-03:00`).toISOString();
//     const end = new Date(`${dataHoje}T23:59:59.999-03:00`).toISOString();

//     const { data, error } = await supabase
//       .from('lancamentos')
//       .select('tipo, valor')
//       .gte('data_hora', start)
//       .lte('data_hora', end);

//     if (error) {
//       console.error(error);
//       setLoading(false);
//       return;
//     }

//     let totalEntradas = 0;
//     let totalSaidas = 0;

//     data.forEach(lanc => {
//       if (lanc.tipo === 'ENTRADA') totalEntradas += Number(lanc.valor);
//       if (lanc.tipo === 'SAIDA') totalSaidas += Number(lanc.valor);
//     });

//     setEntradas(totalEntradas);
//     setSaidas(totalSaidas);
//     setLoading(false);
//   }

//   // ==========================================
//   // BUSCA DADOS DO HISTÓRICO (FILTRO POR DATA)
//   // ==========================================
//   async function carregarHistorico(dataEscolhida) {
//     setLoading(true);
//     const start = new Date(`${dataEscolhida}T00:00:00-03:00`).toISOString();
//     const end = new Date(`${dataEscolhida}T23:59:59.999-03:00`).toISOString();

//     const { data, error } = await supabase
//       .from('lancamentos')
//       .select('*')
//       .gte('data_hora', start)
//       .lte('data_hora', end)
//       .order('data_hora', { ascending: false });

//     if (!error && data) setLancamentos(data);
//     setLoading(false);
//   }

//   // ==========================================
//   // BUSCA ITENS DA VENDA PARA O MODAL
//   // ==========================================
//   async function abrirDetalhes(lanc) {
//     setModalDetalhes(lanc);
//     setItensDetalhe([]);
    
//     // Se for uma entrada, tenta buscar os itens daquela venda
//     if (lanc.tipo === 'ENTRADA') {
//       setBuscandoItens(true);
//       const { data, error } = await supabase
//         .from('itens_venda')
//         .select(`
//           quantidade, preco_unitario, desconto, subtotal,
//           produtos (descricao)
//         `)
//         .eq('lancamento_id', lanc.id);
        
//       if (!error && data) setItensDetalhe(data);
//       setBuscandoItens(false);
//     }
//   }

//   const formatarMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
//   const formatarHora = (dataString) => new Date(dataString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
//   const saldoHoje = entradas - saidas;

//   // Calculos do Filtro Ativo
//   const totalEntradasFiltro = lancamentos.filter(l => l.tipo === 'ENTRADA').reduce((acc, curr) => acc + Number(curr.valor), 0);
//   const totalSaidasFiltro = lancamentos.filter(l => l.tipo === 'SAIDA').reduce((acc, curr) => acc + Number(curr.valor), 0);
//   const saldoFiltro = totalEntradasFiltro - totalSaidasFiltro;

//   const Overlay = ({ children }) => <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{children}</div>;

//   // ==========================================
//   // VISUALIZAÇÃO: TELA DE HISTÓRICO
//   // ==========================================
//   if (telaAtual === 'historico') {
//     return (
//       <main className="tela" style={{ paddingBottom: '30px' }}>
        
//         {/* MODAL DE DETALHES DO LANÇAMENTO */}
//         {modalDetalhes && (
//           <Overlay>
//             <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '16px', width: '90%', maxWidth: '400px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
              
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
//                 <h3 style={{ color: '#374151', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
//                   <IconReceipt color="#4f46e5" /> Detalhes
//                 </h3>
//                 <button onClick={() => setModalDetalhes(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
//                   <IconClose color="#9ca3af" />
//                 </button>
//               </div>

//               <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
//                   <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Data/Hora:</span>
//                   <strong style={{ color: '#374151', fontSize: '0.85rem' }}>{new Date(modalDetalhes.data_hora).toLocaleString('pt-BR')}</strong>
//                 </div>
                
//                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
//                   <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Tipo:</span>
//                   <strong style={{ color: modalDetalhes.tipo === 'ENTRADA' ? '#10b981' : '#ef4444', fontSize: '0.85rem' }}>
//                     {modalDetalhes.tipo === 'ENTRADA' ? 'ENTRADA (Venda)' : 'SAÍDA (Despesa)'}
//                   </strong>
//                 </div>

//                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
//                   <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Pagamento:</span>
//                   <strong style={{ color: '#374151', fontSize: '0.85rem' }}>{modalDetalhes.forma_pagamento || 'Não info.'}</strong>
//                 </div>

//                 {modalDetalhes.descricao && (
//                   <div style={{ marginBottom: '15px', backgroundColor: '#f9fafb', padding: '10px', borderRadius: '8px' }}>
//                     <span style={{ color: '#6b7280', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Descrição / Origem:</span>
//                     <strong style={{ color: '#374151', fontSize: '0.9rem' }}>{modalDetalhes.descricao}</strong>
//                   </div>
//                 )}

//                 {/* SESSÃO DE ITENS VENDIDOS */}
//                 {modalDetalhes.tipo === 'ENTRADA' && (
//                   <div style={{ marginTop: '20px' }}>
//                     <h4 style={{ fontSize: '0.9rem', color: '#4b5563', borderBottom: '1px solid #e5e7eb', paddingBottom: '5px', marginBottom: '10px' }}>PRODUTOS DA VENDA</h4>
                    
//                     {buscandoItens ? (
//                       <p style={{ fontSize: '0.8rem', color: '#6b7280', textAlign: 'center' }}>Carregando produtos...</p>
//                     ) : itensDetalhe.length === 0 ? (
//                       <p style={{ fontSize: '0.8rem', color: '#9ca3af', textAlign: 'center' }}>Venda sem produtos avulsos ou lançamento manual antigo.</p>
//                     ) : (
//                       <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
//                         {itensDetalhe.map((item, i) => (
//                           <div key={i} style={{ backgroundColor: '#f3f4f6', padding: '10px', borderRadius: '8px', fontSize: '0.85rem' }}>
//                             <strong style={{ display: 'block', color: '#374151', marginBottom: '4px' }}>{item.produtos?.descricao || 'Produto Removido'}</strong>
//                             <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//                               <span style={{ color: '#6b7280' }}>{item.quantidade}x {formatarMoeda(item.preco_unitario)}</span>
//                               <strong style={{ color: '#10b981' }}>{formatarMoeda(item.subtotal)}</strong>
//                             </div>
//                             {item.desconto > 0 && <span style={{ display: 'block', color: '#ef4444', fontSize: '0.75rem', marginTop: '2px' }}>Desc: -{formatarMoeda(item.desconto)}</span>}
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>

//               {/* TOTAIS DO MODAL */}
//               <div style={{ marginTop: '20px', backgroundColor: modalDetalhes.tipo === 'ENTRADA' ? '#ecfdf5' : '#fef2f2', padding: '15px', borderRadius: '12px' }}>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
//                   <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Valor Bruto:</span>
//                   <strong style={{ color: '#374151' }}>{formatarMoeda(Number(modalDetalhes.valor) + Number(modalDetalhes.desconto || 0))}</strong>
//                 </div>
//                 {modalDetalhes.desconto > 0 && (
//                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
//                     <span style={{ color: '#ef4444', fontSize: '0.85rem' }}>Desconto Global:</span>
//                     <strong style={{ color: '#ef4444' }}>-{formatarMoeda(modalDetalhes.desconto)}</strong>
//                   </div>
//                 )}
//                 <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '10px' }}>
//                   <strong style={{ color: '#374151', fontSize: '1rem' }}>TOTAL {modalDetalhes.tipo}:</strong>
//                   <strong style={{ color: modalDetalhes.tipo === 'ENTRADA' ? '#10b981' : '#ef4444', fontSize: '1.2rem' }}>
//                     {formatarMoeda(modalDetalhes.valor)}
//                   </strong>
//                 </div>
                
//                 {modalDetalhes.troco > 0 && (
//                   <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
//                     <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>Dinheiro Recebido: {formatarMoeda(modalDetalhes.valor_recebido)}</span>
//                     <strong style={{ color: '#4f46e5', fontSize: '0.85rem' }}>Troco: {formatarMoeda(modalDetalhes.troco)}</strong>
//                   </div>
//                 )}
//               </div>
              
//               <button onClick={() => setModalDetalhes(null)} className="btn-secundario" style={{ margin: '15px 0 0 0' }}>FECHAR</button>
//             </div>
//           </Overlay>
//         )}

//         {/* CABEÇALHO DO HISTÓRICO */}
//         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
//           <button onClick={() => setTelaAtual('resumo')} style={{ background: 'transparent', border: 'none', color: '#4f46e5', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
//             <IconArrowLeft /> VOLTAR
//           </button>
//           <h2 style={{ fontSize: '1.1rem', margin: 0, color: '#374151' }}>HISTÓRICO</h2>
//         </div>

//         {/* FILTRO DE DATA */}
//         <div style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '20px' }}>
//           <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
//             <IconCalendar size="16" /> Escolha a Data
//           </label>
//           <input 
//             type="date" 
//             value={dataFiltro} 
//             onChange={(e) => setDataFiltro(e.target.value)} 
//             className="input-padrao" 
//             style={{ margin: 0 }}
//           />
//         </div>

//         {/* RESUMO DO FILTRO */}
//         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
//           <div style={{ backgroundColor: '#ecfdf5', padding: '15px', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
//             <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 'bold' }}>ENTRADAS</span>
//             <strong style={{ display: 'block', fontSize: '1.1rem', color: '#10b981', marginTop: '5px' }}>{formatarMoeda(totalEntradasFiltro)}</strong>
//           </div>
//           <div style={{ backgroundColor: '#fef2f2', padding: '15px', borderRadius: '12px', border: '1px solid #fecaca' }}>
//             <span style={{ fontSize: '0.75rem', color: '#b91c1c', fontWeight: 'bold' }}>SAÍDAS</span>
//             <strong style={{ display: 'block', fontSize: '1.1rem', color: '#ef4444', marginTop: '5px' }}>{formatarMoeda(totalSaidasFiltro)}</strong>
//           </div>
//         </div>

//         {/* LISTA DE LANÇAMENTOS */}
//         {loading ? (
//           <p style={{ textAlign: 'center', color: '#6b7280' }}>Carregando...</p>
//         ) : lancamentos.length === 0 ? (
//           <p style={{ textAlign: 'center', color: '#9ca3af', marginTop: '30px' }}>Nenhum lançamento encontrado nesta data.</p>
//         ) : (
//           <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
//             <h3 style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '5px' }}>Transações:</h3>
//             {lancamentos.map(lanc => (
//               <div 
//                 key={lanc.id} 
//                 onClick={() => abrirDetalhes(lanc)}
//                 style={{ 
//                   backgroundColor: 'white', padding: '15px', borderRadius: '12px', border: '1px solid #e5e7eb', 
//                   display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
//                   boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
//                 }}
//               >
//                 <div style={{ flex: 1, minWidth: 0, paddingRight: '10px' }}>
//                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
//                     <span style={{ fontSize: '0.7rem', backgroundColor: lanc.tipo === 'ENTRADA' ? '#ecfdf5' : '#fef2f2', color: lanc.tipo === 'ENTRADA' ? '#10b981' : '#ef4444', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
//                       {lanc.tipo}
//                     </span>
//                     <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{formatarHora(lanc.data_hora)}</span>
//                   </div>
//                   <strong style={{ display: 'block', fontSize: '0.9rem', color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
//                     {lanc.descricao}
//                   </strong>
//                   <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{lanc.forma_pagamento || 'N/A'}</span>
//                 </div>
//                 <strong style={{ color: lanc.tipo === 'ENTRADA' ? '#10b981' : '#ef4444', fontSize: '1.1rem', flexShrink: 0 }}>
//                   {lanc.tipo === 'ENTRADA' ? '+' : '-'}{formatarMoeda(lanc.valor)}
//                 </strong>
//               </div>
//             ))}
//           </div>
//         )}
//       </main>
//     );
//   }

//   // ==========================================
//   // VISUALIZAÇÃO: TELA RESUMO (INICIAL PADRÃO)
//   // ==========================================
//   return (
//     <main className="tela" style={{ display: 'flex', flexDirection: 'column' }}>
//       <header style={{ marginBottom: '20px' }}>
//         <h1>Caixa & Estoque Fácil</h1>
//         <h2 style={{ color: '#4f46e5' }}>RESUMO DO CAIXA</h2>
//         <p style={{ color: '#6b7280', fontSize: '0.9rem', fontWeight: 'bold' }}>HOJE - {new Date().toLocaleDateString('pt-BR')}</p>
//       </header>
      
//       {loading ? (
//         <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#9ca3af' }}>Atualizando...</div>
//       ) : (
//         <div className="resumo-box" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
//           <div className="linha-resumo">
//             <span style={{ fontWeight: 'bold', color: '#10b981' }}>+ ENTRADAS (HOJE)</span> 
//             <span className="valor-entrada" style={{ fontSize: '1.3rem' }}>{formatarMoeda(entradas)}</span>
//           </div>
//           <div className="linha-resumo" style={{ marginTop: '15px' }}>
//             <span style={{ fontWeight: 'bold', color: '#ef4444' }}>- SAÍDAS (HOJE)</span> 
//             <span className="valor-saida" style={{ fontSize: '1.3rem' }}>{formatarMoeda(saidas)}</span>
//           </div>
          
//           <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px dashed #d1d5db' }} />
          
//           <div className="linha-resumo saldo">
//             <strong style={{ fontSize: '1.2rem', color: '#374151' }}>SALDO DO DIA</strong> 
//             <strong className="valor-saldo" style={{ fontSize: '1.8rem', color: saldoHoje >= 0 ? '#4f46e5' : '#ef4444' }}>
//               {formatarMoeda(saldoHoje)}
//             </strong>
//           </div>
//         </div>
//       )}

//       <div style={{ marginTop: '20px', paddingBottom: '20px' }}>
//         <button 
//           className="btn-secundario" 
//           onClick={() => setTelaAtual('historico')}
//           style={{ width: '100%', height: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', fontSize: '1.1rem', borderColor: '#4f46e5', color: '#4f46e5' }}
//         >
//           <IconList /> VER LANÇAMENTOS
//         </button>
//       </div>
//     </main>
//   );
// }