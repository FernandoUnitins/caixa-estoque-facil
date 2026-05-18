import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Search, BarChart3 } from 'lucide-react';

// ==========================================
// ÍCONES SVG MODERNOS (Estilo Financeiro)
// ==========================================
const IconList = ({ color = "currentColor", size = "24" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>;
const IconCalendar = ({ color = "currentColor", size = "20" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const IconArrowLeft = ({ color = "currentColor", size = "20" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const IconClose = ({ color = "currentColor", size = "24" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const IconReceipt = ({ color = "currentColor", size = "20" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-2 2 2 2-2 2 2 2-2 2 2 2-2 2 2V2l-2 2-2-2-2 2-2-2-2 2-2-2-2 2z"></path><line x1="16" y1="8" x2="8" y2="8"></line><line x1="16" y1="12" x2="8" y2="12"></line><line x1="10" y1="16" x2="8" y2="16"></line></svg>;
const IconTrendingUp = ({ color = "currentColor", size = "20" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>;
const IconTrendingDown = ({ color = "currentColor", size = "20" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>;
const IconWallet = ({ color = "currentColor", size = "24" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>;
const IconMonitor = ({ color = "currentColor", size = "18" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>;

export default function TelaResumo() {
  const [telaAtual, setTelaAtual] = useState('resumo'); // 'resumo' ou 'historico'
  const [loading, setLoading] = useState(false);

  // ==========================================
  // GERADOR DE DATAS SEGURO (Prevenção de Tela Branca)
  // ==========================================
  const getSafeDateString = (d) => {
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  };

  const hoje = new Date();
  const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

  const dataHojeStr = getSafeDateString(hoje);
  const dataInicioMesStr = getSafeDateString(primeiroDiaMes);
  const dataFimMesStr = getSafeDateString(ultimoDiaMes);

  // ==========================================
  // ESTADOS - RESUMO DO DIA (HOJE)
  // ==========================================
  const [entradas, setEntradas] = useState(0);
  const [saidas, setSaidas] = useState(0);
  const [caixasAbertos, setCaixasAbertos] = useState([]); 

  // ==========================================
  // ESTADOS - DASHBOARD FINANCEIRO (MÊS/PERÍODO)
  // ==========================================
  const [dataInicioDash, setDataInicioDash] = useState(dataInicioMesStr);
  const [dataFimDash, setDataFimDash] = useState(dataFimMesStr);
  const [buscandoDash, setBuscandoDash] = useState(false);
  const [lancamentosDash, setLancamentosDash] = useState([]);
  const [lancamentosGrafico, setLancamentosGrafico] = useState([]);
  const [detalheGrafico, setDetalheGrafico] = useState(null);

  // ==========================================
  // ESTADOS - HISTÓRICO FILTRADO (TELA SECUNDÁRIA)
  // ==========================================
  const [dataFiltro, setDataFiltro] = useState(dataHojeStr);
  const [lancamentos, setLancamentos] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [ordenacao, setOrdenacao] = useState('data_desc');
  const [modalDetalhes, setModalDetalhes] = useState(null);
  const [itensDetalhe, setItensDetalhe] = useState([]);
  const [buscandoItens, setBuscandoItens] = useState(false);

  useEffect(() => {
    if (telaAtual === 'resumo') {
      carregarResumoHojeEDashboard();
    } else {
      carregarHistorico(dataFiltro);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telaAtual, dataFiltro]);

  async function carregarResumoHojeEDashboard() {
    try {
      setLoading(true);

      // 1. CARREGAR DADOS DE HOJE
      const startHoje = new Date(`${dataHojeStr}T00:00:00-03:00`).toISOString();
      const endHoje = new Date(`${dataHojeStr}T23:59:59.999-03:00`).toISOString();

      const { data: dadosHoje } = await supabase
        .from('lancamentos')
        .select('tipo, valor')
        .gte('data_hora', startHoje)
        .lte('data_hora', endHoje);

      if (dadosHoje) {
        let totEnt = 0; let totSai = 0;
        dadosHoje.forEach(lanc => {
          if (lanc.tipo === 'ENTRADA' || lanc.tipo === 'REFORCO') totEnt += Number(lanc.valor);
          if (lanc.tipo === 'SAIDA' || lanc.tipo === 'SANGRIA') totSai += Number(lanc.valor);
        });
        setEntradas(totEnt);
        setSaidas(totSai);
      }

      // 2. BUSCA OS CAIXAS ABERTOS
      const { data: sessoesAbertas } = await supabase
        .from('caixas_sessoes')
        .select('*, usuarios(nome)')
        .eq('status', 'ABERTO')
        .order('data_abertura', { ascending: false });
      
      if (sessoesAbertas) setCaixasAbertos(sessoesAbertas);

      // 3. CARREGA DADOS DO DASHBOARD
      await buscarLancamentosDash(dataInicioDash, dataFimDash);
      await carregarDadosGrafico();

    } catch (e) {
      console.error('Erro ao processar dados de resumo', e);
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // FUNÇÕES DO DASHBOARD
  // ==========================================
  async function carregarDadosGrafico() {
    try {
      const d = new Date();
      d.setDate(d.getDate() - 6); 
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0).toISOString();
      
      const { data } = await supabase.from('lancamentos')
        .select('tipo, valor, data_hora')
        .gte('data_hora', start);
        
      if (data) setLancamentosGrafico(data);
    } catch(e) {
      console.error(e);
    }
  }

  async function buscarLancamentosDash(inicio, fim) {
    if (!inicio || !fim) return;
    try {
      setBuscandoDash(true);
      const start = new Date(`${inicio}T00:00:00-03:00`).toISOString();
      const end = new Date(`${fim}T23:59:59.999-03:00`).toISOString();
      
      const { data } = await supabase.from('lancamentos')
        .select('tipo, valor')
        .gte('data_hora', start)
        .lte('data_hora', end);

      if (data) setLancamentosDash(data);
    } catch(e) {
      console.error('Erro no formato de data do Dashboard', e);
    } finally {
      setBuscandoDash(false);
    }
  }

  // ==========================================
  // FUNÇÕES DO HISTÓRICO (Secundária)
  // ==========================================
  async function carregarHistorico(dataEscolhida) {
    if (!dataEscolhida) return;
    try {
      setLoading(true);
      const start = new Date(`${dataEscolhida}T00:00:00-03:00`).toISOString();
      const end = new Date(`${dataEscolhida}T23:59:59.999-03:00`).toISOString();

      const { data, error } = await supabase
        .from('lancamentos')
        .select('*, caixas_sessoes ( usuarios ( nome ) )')
        .gte('data_hora', start)
        .lte('data_hora', end);

      if (!error && data) setLancamentos(data);
    } catch(e) {
      console.error('Erro na data do histórico', e);
    } finally {
      setLoading(false);
    }
  }

  async function abrirDetalhes(lanc) {
    setModalDetalhes(lanc);
    setItensDetalhe([]);
    
    if (lanc.tipo === 'ENTRADA') {
      setBuscandoItens(true);
      const { data, error } = await supabase
        .from('itens_venda')
        .select('quantidade, preco_unitario, desconto, subtotal, produtos (descricao)')
        .eq('lancamento_id', lanc.id);
        
      if (!error && data) setItensDetalhe(data);
      setBuscandoItens(false);
    }
  }

  // Utilitários de formatação e Overlay
  const formatarMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatarHora = (dataString) => {
    if(!dataString) return '--:--';
    return new Date(dataString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };
  const Overlay = ({ children }) => <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{children}</div>;

  // ==========================================
  // CÁLCULOS MATEMÁTICOS BLINDADOS
  // ==========================================
  
  // 1. Cálculos de Hoje
  const saldoHoje = entradas - saidas;

  // 2. Cálculos do Dashboard
  const totalEntradasDash = lancamentosDash.filter(l => l.tipo === 'ENTRADA' || l.tipo === 'REFORCO').reduce((acc, l) => acc + Number(l.valor), 0);
  const totalSaidasDash = lancamentosDash.filter(l => l.tipo === 'SAIDA' || l.tipo === 'SANGRIA').reduce((acc, l) => acc + Number(l.valor), 0);
  const saldoLiquidoDash = totalEntradasDash - totalSaidasDash;

  // 3. Gráfico de 7 Dias
  const ultimos7Dias = [];
  const diaReferenciaGrafico = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(diaReferenciaGrafico);
    d.setDate(d.getDate() - i);
    const dataIso = d.toISOString().split('T')[0];
    
    // Evitar erros se data_hora vier null do banco de dados
    const lancsDia = lancamentosGrafico.filter(l => l.data_hora && l.data_hora.startsWith(dataIso));
    const ent = lancsDia.filter(l => l.tipo === 'ENTRADA' || l.tipo === 'REFORCO').reduce((acc, l) => acc + Number(l.valor), 0);
    const sai = lancsDia.filter(l => l.tipo === 'SAIDA' || l.tipo === 'SANGRIA').reduce((acc, l) => acc + Number(l.valor), 0);
    
    ultimos7Dias.push({ 
      diaSemana: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase(), 
      diaMes: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      dataCompleta: d.toLocaleDateString('pt-BR'),
      entradas: ent, 
      saidas: sai 
    });
  }
  
  // Garantia total contra divisão por 0 e Math.max() retornando -Infinity:
  const arrayValores = ultimos7Dias.flatMap(d => [d.entradas, d.saidas]);
  const maiorValorGrafico = Math.max(...arrayValores, 1); // Nunca será menor que 1.

  // 4. Cálculos do Histórico Secundário
  const lancamentosFiltrados = lancamentos.filter(l => {
    if (filtroTipo === 'ENTRADA') return l.tipo === 'ENTRADA' || l.tipo === 'REFORCO';
    if (filtroTipo === 'SAIDA') return l.tipo === 'SAIDA' || l.tipo === 'SANGRIA';
    return true;
  }).sort((a, b) => {
    if (ordenacao === 'data_desc') return new Date(b.data_hora || 0) - new Date(a.data_hora || 0);
    if (ordenacao === 'data_asc') return new Date(a.data_hora || 0) - new Date(b.data_hora || 0);
    if (ordenacao === 'valor_desc') return Number(b.valor) - Number(a.valor);
    if (ordenacao === 'valor_asc') return Number(a.valor) - Number(b.valor);
    if (ordenacao === 'usuario') {
      const nomeA = a.caixas_sessoes?.usuarios?.nome || 'Z';
      const nomeB = b.caixas_sessoes?.usuarios?.nome || 'Z';
      return nomeA.localeCompare(nomeB);
    }
    return 0;
  });

  const totalEntradasFiltro = lancamentos.filter(l => l.tipo === 'ENTRADA' || l.tipo === 'REFORCO').reduce((acc, curr) => acc + Number(curr.valor), 0);
  const totalSaidasFiltro = lancamentos.filter(l => l.tipo === 'SAIDA' || l.tipo === 'SANGRIA').reduce((acc, curr) => acc + Number(curr.valor), 0);

  // ==========================================
  // RENDERIZAÇÃO: TELA DE HISTÓRICO (Secundária)
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
                  <strong style={{ color: '#374151', fontSize: '0.85rem' }}>{modalDetalhes.data_hora ? new Date(modalDetalhes.data_hora).toLocaleString('pt-BR') : '--'}</strong>
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

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Operador:</span>
                  <strong style={{ color: '#374151', fontSize: '0.85rem' }}>{modalDetalhes.caixas_sessoes?.usuarios?.nome || 'Desconhecido'}</strong>
                </div>

                {modalDetalhes.descricao && (
                  <div style={{ marginBottom: '15px', backgroundColor: '#f9fafb', padding: '10px', borderRadius: '8px' }}>
                    <span style={{ color: '#6b7280', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Descrição / Origem:</span>
                    <strong style={{ color: '#374151', fontSize: '0.9rem' }}>{modalDetalhes.descricao}</strong>
                  </div>
                )}

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

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <button onClick={() => setTelaAtual('resumo')} style={{ background: 'transparent', border: 'none', color: '#4f46e5', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', padding: 0 }}>
            <IconArrowLeft /> VOLTAR
          </button>
          <h2 style={{ fontSize: '1.1rem', margin: 0, color: '#374151' }}>HISTÓRICO</h2>
        </div>

        <div style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '15px' }}>
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '5px' }}>
            <button onClick={() => setFiltroTipo('TODOS')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: filtroTipo === 'TODOS' ? '#4f46e5' : '#f3f4f6', color: filtroTipo === 'TODOS' ? 'white' : '#4b5563', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}>TODOS</button>
            <button onClick={() => setFiltroTipo('ENTRADA')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: filtroTipo === 'ENTRADA' ? '#10b981' : '#f3f4f6', color: filtroTipo === 'ENTRADA' ? 'white' : '#4b5563', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}>ENTRADAS</button>
            <button onClick={() => setFiltroTipo('SAIDA')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: filtroTipo === 'SAIDA' ? '#ef4444' : '#f3f4f6', color: filtroTipo === 'SAIDA' ? 'white' : '#4b5563', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}>SAÍDAS</button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb', padding: '10px 15px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4b5563' }}>Ordenar por:</span>
            <select value={ordenacao} onChange={e => setOrdenacao(e.target.value)} className="input-padrao" style={{ width: 'auto', padding: '6px 10px', fontSize: '0.8rem', margin: 0, minHeight: 'auto', border: '1px solid #d1d5db' }}>
              <option value="data_desc">Ordem Lançamento</option>
              <option value="data_asc">Mais Antigos</option>
              <option value="valor_desc">Maior Valor</option>
              <option value="valor_asc">Menor Valor</option>
              <option value="usuario">Operador</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#6b7280' }}>Carregando...</p>
        ) : lancamentosFiltrados.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#9ca3af', marginTop: '30px' }}>Nenhum lançamento encontrado para este filtro.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3 style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '5px' }}>Transações:</h3>
            {lancamentosFiltrados.map(lanc => (
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
                  
                  <span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span>{lanc.forma_pagamento || 'N/A'}</span>
                    <span>•</span>
                    <span style={{ color: '#4f46e5', fontWeight: '600' }}>Op: {lanc.caixas_sessoes?.usuarios?.nome || 'Desconhecido'}</span>
                  </span>
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
  // VISUALIZAÇÃO: TELA RESUMO PRINCIPAL (HOJE + DASHBOARD)
  // ==========================================
  return (
    <main className="tela" style={{ display: 'flex', flexDirection: 'column' }}>
      
      {/* MODAL DO GRÁFICO */}
      {detalheGrafico && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '16px', width: '90%', maxWidth: '300px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 5px 0', color: '#374151', fontSize: '1.2rem' }}>Movimentação</h3>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '20px', fontWeight: '600' }}>{detalheGrafico.dataCompleta}</p>
            
            <div style={{ backgroundColor: '#ecfdf5', padding: '12px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #a7f3d0' }}>
              <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 'bold' }}>ENTRADAS</span>
              <strong style={{ display: 'block', fontSize: '1.2rem', color: '#10b981' }}>{formatarMoeda(detalheGrafico.entradas)}</strong>
            </div>
            
            <div style={{ backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #fecaca' }}>
              <span style={{ fontSize: '0.75rem', color: '#b91c1c', fontWeight: 'bold' }}>SAÍDAS</span>
              <strong style={{ display: 'block', fontSize: '1.2rem', color: '#ef4444' }}>{formatarMoeda(detalheGrafico.saidas)}</strong>
            </div>

            <button onClick={() => setDetalheGrafico(null)} className="btn-secundario" style={{ margin: 0, width: '100%' }}>FECHAR</button>
          </div>
        </div>
      )}

      {/* CABEÇALHO RESUMO HOJE */}
      <header style={{ marginBottom: '25px', textAlign: 'center' }}>
        <h2 style={{ color: '#374151', fontSize: '1.4rem', margin: '0 0 5px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          RESUMO DO CAIXA
        </h2>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#f3f4f6', padding: '4px 12px', borderRadius: '20px', color: '#6b7280', fontSize: '0.85rem', fontWeight: '600' }}>
          <IconCalendar size="14" /> HOJE • {new Date().toLocaleDateString('pt-BR')}
        </div>
      </header>
      
      {loading ? (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#9ca3af', padding: '50px 0' }}>Atualizando dados...</div>
      ) : (
        <div className="resumo-box" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div style={{ backgroundColor: '#ecfdf5', padding: '20px 15px', borderRadius: '16px', border: '1px solid #a7f3d0', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.05)' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#047857' }}>
                  <IconTrendingUp size="18" /> 
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>ENTRADAS</span>
               </div>
               <strong style={{ fontSize: '1.4rem', color: '#10b981' }}>{formatarMoeda(entradas)}</strong>
            </div>

            <div style={{ backgroundColor: '#fef2f2', padding: '20px 15px', borderRadius: '16px', border: '1px solid #fecaca', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 4px 6px rgba(239, 68, 68, 0.05)' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#b91c1c' }}>
                  <IconTrendingDown size="18" /> 
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>SAÍDAS</span>
               </div>
               <strong style={{ fontSize: '1.4rem', color: '#ef4444' }}>{formatarMoeda(saidas)}</strong>
            </div>
          </div>
          
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

          <div style={{ marginTop: '20px' }}>
            <h3 style={{ color: '#4b5563', fontSize: '1rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IconMonitor size="18" /> Status dos Caixas (Em Operação)
            </h3>
            {caixasAbertos.length === 0 ? (
              <div style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '12px', textAlign: 'center', color: '#6b7280', fontSize: '0.85rem', border: '1px dashed #d1d5db' }}>
                Nenhum caixa aberto no momento.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {caixasAbertos.map(caixa => (
                  <div key={caixa.id} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                        <span style={{ backgroundColor: '#ecfdf5', color: '#10b981', padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 'bold' }}>ABERTO</span>
                        <strong style={{ color: '#374151', fontSize: '0.95rem' }}>{caixa.usuarios?.nome || 'Operador'}</strong>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span>Abertura: {new Date(caixa.data_abertura).toLocaleString('pt-BR')}</span>
                        <span>Fundo Inicial: <strong style={{color: '#4f46e5'}}>{formatarMoeda(caixa.valor_abertura)}</strong></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ==================================================== */}
          {/* SESSÃO DASHBOARD FINANCEIRO                          */}
          {/* ==================================================== */}
          <div style={{ marginTop: '30px', borderTop: '2px dashed #e5e7eb', paddingTop: '20px' }}>
            <header style={{ marginBottom: '20px', textAlign: 'center' }}>
              <h2 style={{ color: '#374151', fontSize: '1.4rem', margin: '0 0 5px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <BarChart3 size="24" color="#4f46e5" /> DASHBOARD FINANCEIRO
              </h2>
              <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>Visão geral do faturamento e métricas</p>
            </header>

            <div style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '20px' }}>
              <h3 style={{ color: '#374151', marginBottom: '10px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Search size="18" /> Filtrar Período do Resumo
              </h3>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 45%' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#4b5563', display: 'block', marginBottom: '5px' }}>Data Inicial</label>
                  <input type="date" value={dataInicioDash} onChange={e => setDataInicioDash(e.target.value)} className="input-padrao" style={{ margin: 0, padding: '10px' }} />
                </div>
                <div style={{ flex: '1 1 45%' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#4b5563', display: 'block', marginBottom: '5px' }}>Data Final</label>
                  <input type="date" value={dataFimDash} onChange={e => setDataFimDash(e.target.value)} className="input-padrao" style={{ margin: 0, padding: '10px' }} />
                </div>
                <button 
                  onClick={() => buscarLancamentosDash(dataInicioDash, dataFimDash)} 
                  className="btn-entrada" 
                  style={{ flex: '1 1 100%', margin: 0, padding: '10px 15px', height: 'auto' }} 
                  disabled={buscandoDash}
                >
                  {buscandoDash ? 'FILTRANDO...' : 'APLICAR FILTRO'}
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '20px' }}>
              <div style={{ backgroundColor: '#ecfdf5', padding: '15px', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><IconTrendingUp color="#10b981" size="14"/> RECEITAS</span>
                <strong style={{ display: 'block', fontSize: '1.3rem', color: '#10b981', marginTop: '5px' }}>{formatarMoeda(totalEntradasDash)}</strong>
              </div>
              <div style={{ backgroundColor: '#fef2f2', padding: '15px', borderRadius: '12px', border: '1px solid #fecaca' }}>
                <span style={{ fontSize: '0.75rem', color: '#b91c1c', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><IconTrendingDown color="#ef4444" size="14"/> DESPESAS</span>
                <strong style={{ display: 'block', fontSize: '1.3rem', color: '#ef4444', marginTop: '5px' }}>{formatarMoeda(totalSaidasDash)}</strong>
              </div>
              <div style={{ backgroundColor: saldoLiquidoDash >= 0 ? '#eef2ff' : '#fef2f2', padding: '15px', borderRadius: '12px', border: `1px solid ${saldoLiquidoDash >= 0 ? '#c7d2fe' : '#fecaca'}` }}>
                <span style={{ fontSize: '0.75rem', color: saldoLiquidoDash >= 0 ? '#4338ca' : '#b91c1c', fontWeight: 'bold' }}>SALDO NO PERÍODO</span>
                <strong style={{ display: 'block', fontSize: '1.3rem', color: saldoLiquidoDash >= 0 ? '#4f46e5' : '#ef4444', marginTop: '5px' }}>{formatarMoeda(saldoLiquidoDash)}</strong>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              <h3 style={{ color: '#4b5563', fontSize: '0.95rem', marginBottom: '20px', textAlign: 'center' }}>Movimentação Diária (Últimos 7 dias)</h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '180px', paddingBottom: '10px', borderBottom: '1px solid #e5e7eb' }}>
                {ultimos7Dias.map((dia, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setDetalheGrafico(dia)}
                    style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', height: '100%', width: '12%', gap: '2px', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'flex-end', height: '100%', gap: '2px' }}>
                      <div title={`Entradas: ${formatarMoeda(dia.entradas)}`} style={{ backgroundColor: '#10b981', width: '45%', borderRadius: '4px 4px 0 0', height: dia.entradas > 0 ? Math.max((dia.entradas / maiorValorGrafico) * 100, 8) + '%' : '0%', transition: 'height 1s ease-out' }}></div>
                      <div title={`Saídas: ${formatarMoeda(dia.saidas)}`} style={{ backgroundColor: '#ef4444', width: '45%', borderRadius: '4px 4px 0 0', height: dia.saidas > 0 ? Math.max((dia.saidas / maiorValorGrafico) * 100, 8) + '%' : '0%', transition: 'height 1s ease-out' }}></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px' }}>
                {ultimos7Dias.map((dia, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '12%' }}>
                    <span style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: 'bold' }}>{dia.diaSemana}</span>
                    <span style={{ fontSize: '0.6rem', color: '#9ca3af', marginTop: '2px' }}>{dia.diaMes}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
                <span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width:'10px', height:'10px', backgroundColor:'#10b981', borderRadius:'2px'}}></div> Entradas</span>
                <span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width:'10px', height:'10px', backgroundColor:'#ef4444', borderRadius:'2px'}}></div> Saídas</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOTÃO PARA ACESSAR HISTÓRICO MANUAL DO DIA */}
      <div style={{ marginTop: '25px', paddingBottom: '10px' }}>
        <button 
          className="btn-secundario" 
          onClick={() => setTelaAtual('historico')}
          style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', fontSize: '1.05rem', color: '#4f46e5', border: '2px solid #eef2ff', backgroundColor: '#eef2ff' }}
        >
          <IconList /> VER HISTÓRICO DO DIA
        </button>
      </div>
    </main>
  );
}