import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  BarChart3, FileText, Download, Printer, TrendingUp, TrendingDown, Search
} from 'lucide-react';

export default function TelaRelatorios() {
  const [abaAtiva, setAbaAtiva] = useState('dashboard'); // 'dashboard' ou 'relatorios'
  const [loading, setLoading] = useState(true);
  const [buscandoFiltro, setBuscandoFiltro] = useState(false);

  // Calcula o primeiro e último dia do mês corrente para o valor padrão
  const hoje = new Date();
  const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
  const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0];

  const [dataInicio, setDataInicio] = useState(primeiroDiaMes);
  const [dataFim, setDataFim] = useState(ultimoDiaMes);

  // Dados brutos do banco
  const [produtos, setProdutos] = useState([]);
  const [lancamentos, setLancamentos] = useState([]);
  const [itensVenda, setItensVenda] = useState([]);
  
  // Estado exclusivo para o Gráfico (últimos 7 dias a partir de hoje)
  const [lancamentosGrafico, setLancamentosGrafico] = useState([]);
  const [detalheGrafico, setDetalheGrafico] = useState(null); // Controla o Modal do Gráfico

  // Estados dos Filtros de Relatório
  const [tipoRelatorio, setTipoRelatorio] = useState('mais_vendidos');

  async function carregarDadosBase() {
    setLoading(true);
    
    // Busca Produtos
    const { data: prodData } = await supabase.from('produtos').select('*');
    if (prodData) setProdutos(prodData);

    // Busca Itens Vendidos (Para o relatório de mais vendidos)
    const { data: itensData } = await supabase.from('itens_venda')
      .select('produto_id, quantidade, subtotal, produtos(descricao, codigo_interno)');
    if (itensData) setItensVenda(itensData);

    // Busca os lançamentos com base no mês corrente
    await buscarLancamentos(primeiroDiaMes, ultimoDiaMes);
    
    // Busca dados exclusivos para o gráfico (últimos 7 dias)
    await carregarDadosGrafico();

    setLoading(false);
  }

  async function carregarDadosGrafico() {
    const d = new Date();
    d.setDate(d.getDate() - 6); // Volta 6 dias para dar 7 dias incluindo hoje
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0).toISOString();
    
    const { data } = await supabase.from('lancamentos')
      .select('tipo, valor, data_hora')
      .gte('data_hora', start);
      
    if (data) setLancamentosGrafico(data);
  }

  async function buscarLancamentos(inicio, fim) {
    setBuscandoFiltro(true);
    const start = new Date(`${inicio}T00:00:00-03:00`).toISOString();
    const end = new Date(`${fim}T23:59:59.999-03:00`).toISOString();
    
    const { data: lancData } = await supabase.from('lancamentos')
      .select('*')
      .gte('data_hora', start)
      .lte('data_hora', end);

    if (lancData) setLancamentos(lancData);
    setBuscandoFiltro(false);
  }

  useEffect(() => {
    carregarDadosBase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==========================================
  // PROCESSAMENTO DE DADOS (DASHBOARD)
  // ==========================================
  const totalEntradas = lancamentos.filter(l => l.tipo === 'ENTRADA' || l.tipo === 'REFORCO').reduce((acc, l) => acc + Number(l.valor), 0);
  const totalSaidas = lancamentos.filter(l => l.tipo === 'SAIDA' || l.tipo === 'SANGRIA').reduce((acc, l) => acc + Number(l.valor), 0);
  const saldoLiquido = totalEntradas - totalSaidas;

  // Gerar dados para o Gráfico de Barras (Sempre últimos 7 dias a partir de HOJE)
  const ultimos7Dias = [];
  const hojeRef = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(hojeRef);
    d.setDate(d.getDate() - i);
    const dataIso = d.toISOString().split('T')[0];
    
    const lancsDia = lancamentosGrafico.filter(l => l.data_hora.startsWith(dataIso));
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

  const maiorValorGrafico = Math.max(...ultimos7Dias.map(d => Math.max(d.entradas, d.saidas, 1))); // Garante que nunca é 0 para não quebrar o CSS

  // ==========================================
  // PROCESSAMENTO DE DADOS (RELATÓRIOS)
  // ==========================================
  const gerarDadosRelatorio = () => {
    switch (tipoRelatorio) {
      case 'mais_vendidos': {
        const mapaVendas = {};
        itensVenda.forEach(item => {
          if (!mapaVendas[item.produto_id]) {
            mapaVendas[item.produto_id] = { nome: item.produtos?.descricao || 'Deletado', codigo: item.produtos?.codigo_interno || '-', qtd: 0, total: 0 };
          }
          mapaVendas[item.produto_id].qtd += item.quantidade;
          mapaVendas[item.produto_id].total += item.subtotal;
        });
        return Object.values(mapaVendas).sort((a, b) => b.qtd - a.qtd).slice(0, 50); // Top 50
      }

      case 'estoque_zero': {
        return produtos.filter(p => p.estoque <= 0).sort((a, b) => a.descricao.localeCompare(b.descricao));
      }

      case 'estoque_minimo': {
        return produtos.filter(p => p.estoque > 0 && p.estoque <= 5).sort((a, b) => a.estoque - b.estoque);
      }

      case 'validade': {
        const hojeValidade = new Date();
        const trintaDias = new Date();
        trintaDias.setDate(hojeValidade.getDate() + 30);
        
        return produtos.filter(p => p.validade && new Date(p.validade) <= trintaDias)
          .sort((a, b) => new Date(a.validade) - new Date(b.validade));
      }

      default:
        return [];
    }
  };

  const dadosRelatorioAtual = gerarDadosRelatorio();

  // ==========================================
  // EXPORTAÇÃO E IMPRESSÃO
  // ==========================================
  const imprimirPDF = () => {
    window.print();
  };

  const exportarExcel = () => {
    if (dadosRelatorioAtual.length === 0) return alert("Nenhum dado para exportar");

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // BOM para acentos no Excel
    
    // Cabeçalhos
    if (tipoRelatorio === 'mais_vendidos') {
      csvContent += "Codigo,Produto,Qtd Vendida,Total Arrecadado\r\n";
      dadosRelatorioAtual.forEach(r => {
        csvContent += `"${r.codigo}","${r.nome}",${r.qtd},${r.total}\r\n`;
      });
    } else {
      csvContent += "ID,Codigo,Produto,Estoque,Preço,Validade\r\n";
      dadosRelatorioAtual.forEach(r => {
        csvContent += `${r.id},"${r.codigo_interno}","${r.descricao}",${r.estoque},${r.preco},"${r.validade || 'N/A'}"\r\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Relatorio_${tipoRelatorio}_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Formatação Moeda
  const formatarMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Estilos Injetados para Impressão (Oculta tudo exceto a tabela)
  const printStyles = `
    @media print {
      body * { visibility: hidden; }
      #area-impressao, #area-impressao * { visibility: visible; }
      #area-impressao { position: absolute; left: 0; top: 0; width: 100%; }
      .no-print { display: none !important; }
    }
  `;

  if (loading) {
    return <main className="tela" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Carregando dados empresariais...</main>;
  }

  return (
    <main className="tela" style={{ paddingBottom: '30px' }}>
      <style>{printStyles}</style>

      {/* MODAL DE DETALHES DO GRÁFICO (CLIQUE NA BARRA) */}
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

      {/* CABEÇALHO COM ABAS (Escondido na impressão) */}
      <div className="no-print" style={{ display: 'flex', gap: '10px', marginBottom: '20px', backgroundColor: '#f3f4f6', padding: '5px', borderRadius: '12px' }}>
        <button 
          onClick={() => setAbaAtiva('dashboard')} 
          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: abaAtiva === 'dashboard' ? 'white' : 'transparent', color: abaAtiva === 'dashboard' ? '#4f46e5' : '#6b7280', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: abaAtiva === 'dashboard' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
        >
          <BarChart3 size="18" /> DASHBOARD
        </button>
        <button 
          onClick={() => setAbaAtiva('relatorios')} 
          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: abaAtiva === 'relatorios' ? 'white' : 'transparent', color: abaAtiva === 'relatorios' ? '#4f46e5' : '#6b7280', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: abaAtiva === 'relatorios' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
        >
          <FileText size="18" /> RELATÓRIOS
        </button>
      </div>

      {/* ==================================================== */}
      {/* MODO 1: DASHBOARD VISUAL                             */}
      {/* ==================================================== */}
      {abaAtiva === 'dashboard' && (
        <div className="no-print">
          
          {/* FILTRO DE DATAS DO DASHBOARD */}
          <div style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '20px' }}>
            <h3 style={{ color: '#374151', marginBottom: '10px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Search size="18" /> Filtrar Período
            </h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 45%' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#4b5563', display: 'block', marginBottom: '5px' }}>Data Inicial</label>
                <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="input-padrao" style={{ margin: 0, padding: '10px' }} />
              </div>
              <div style={{ flex: '1 1 45%' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#4b5563', display: 'block', marginBottom: '5px' }}>Data Final</label>
                <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className="input-padrao" style={{ margin: 0, padding: '10px' }} />
              </div>
              <button 
                onClick={() => buscarLancamentos(dataInicio, dataFim)} 
                className="btn-entrada" 
                style={{ flex: '1 1 100%', margin: 0, padding: '10px 15px', height: 'auto' }} 
                disabled={buscandoFiltro}
              >
                {buscandoFiltro ? 'FILTRANDO...' : 'APLICAR FILTRO'}
              </button>
            </div>
          </div>

          <h3 style={{ color: '#374151', marginBottom: '15px', fontSize: '1.1rem' }}>Resumo Financeiro</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '20px' }}>
            <div style={{ backgroundColor: '#ecfdf5', padding: '15px', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
              <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><TrendingUp size="14"/> RECEITAS</span>
              <strong style={{ display: 'block', fontSize: '1.3rem', color: '#10b981', marginTop: '5px' }}>{formatarMoeda(totalEntradas)}</strong>
            </div>
            <div style={{ backgroundColor: '#fef2f2', padding: '15px', borderRadius: '12px', border: '1px solid #fecaca' }}>
              <span style={{ fontSize: '0.75rem', color: '#b91c1c', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><TrendingDown size="14"/> DESPESAS</span>
              <strong style={{ display: 'block', fontSize: '1.3rem', color: '#ef4444', marginTop: '5px' }}>{formatarMoeda(totalSaidas)}</strong>
            </div>
            <div style={{ backgroundColor: saldoLiquido >= 0 ? '#eef2ff' : '#fef2f2', padding: '15px', borderRadius: '12px', border: `1px solid ${saldoLiquido >= 0 ? '#c7d2fe' : '#fecaca'}` }}>
              <span style={{ fontSize: '0.75rem', color: saldoLiquido >= 0 ? '#4338ca' : '#b91c1c', fontWeight: 'bold' }}>SALDO LÍQUIDO</span>
              <strong style={{ display: 'block', fontSize: '1.3rem', color: saldoLiquido >= 0 ? '#4f46e5' : '#ef4444', marginTop: '5px' }}>{formatarMoeda(saldoLiquido)}</strong>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            <h3 style={{ color: '#4b5563', fontSize: '0.95rem', marginBottom: '20px', textAlign: 'center' }}>Movimentação (Últimos 7 dias)</h3>
            
            {/* GRÁFICO DE BARRAS EM PURO CSS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '180px', paddingBottom: '10px', borderBottom: '1px solid #e5e7eb' }}>
              {ultimos7Dias.map((dia, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setDetalheGrafico(dia)}
                  style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', height: '100%', width: '12%', gap: '2px', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'flex-end', height: '100%', gap: '2px' }}>
                    <div title={`Entradas: ${formatarMoeda(dia.entradas)}`} style={{ backgroundColor: '#10b981', width: '45%', borderRadius: '4px 4px 0 0', height: `${(dia.entradas / maiorValorGrafico) * 100}%`, minHeight: '4px', transition: 'height 1s ease-out' }}></div>
                    <div title={`Saídas: ${formatarMoeda(dia.saidas)}`} style={{ backgroundColor: '#ef4444', width: '45%', borderRadius: '4px 4px 0 0', height: `${(dia.saidas / maiorValorGrafico) * 100}%`, minHeight: '4px', transition: 'height 1s ease-out' }}></div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* LEGENDA DO EIXO X (Dia da Semana e Data) */}
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
      )}

      {/* ==================================================== */}
      {/* MODO 2: LISTAS E EXPORTAÇÃO                        */}
      {/* ==================================================== */}
      {abaAtiva === 'relatorios' && (
        <div>
          <div className="no-print" style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '20px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4b5563', display: 'block', marginBottom: '8px' }}>Selecione o Relatório:</label>
            <select value={tipoRelatorio} onChange={(e) => setTipoRelatorio(e.target.value)} className="input-padrao" style={{ margin: 0, backgroundColor: 'white' }}>
              <option value="mais_vendidos">🔥 Produtos Mais Vendidos (Ranking)</option>
              <option value="estoque_zero">❌ Produtos Sem Estoque (Zerados)</option>
              <option value="estoque_minimo">⚠️ Estoque Mínimo (Abaixo de 5 un.)</option>
              <option value="validade">📅 Validade (Vencidos ou em 30 dias)</option>
            </select>

            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button onClick={imprimirPDF} className="btn-entrada" style={{ flex: 1, margin: 0, backgroundColor: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Printer size="18" /> IMPRIMIR / PDF
              </button>
              <button onClick={exportarExcel} className="btn-secundario" style={{ flex: 1, margin: 0, color: '#047857', borderColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Download size="18" /> SALVAR EXCEL
              </button>
            </div>
          </div>

          {/* ÁREA QUE SERÁ IMPRESSA */}
          <div id="area-impressao">
            <div className="apenas-impressao" style={{ display: 'none', marginBottom: '20px', textAlign: 'center' }}>
              <h2>CAIXA & ESTOQUE FÁCIL</h2>
              <h3 style={{ color: '#4b5563' }}>Relatório Gerencial: {
                tipoRelatorio === 'mais_vendidos' ? 'Produtos Mais Vendidos' :
                tipoRelatorio === 'estoque_zero' ? 'Produtos Sem Estoque' :
                tipoRelatorio === 'estoque_minimo' ? 'Alerta de Estoque Mínimo' : 'Controle de Validades'
              }</h3>
              <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>Gerado em {new Date().toLocaleString('pt-BR')}</p>
              <hr style={{ margin: '15px 0' }}/>
            </div>

            <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                  <tr>
                    <th style={{ padding: '12px 15px', fontSize: '0.85rem', color: '#4b5563' }}>Código</th>
                    <th style={{ padding: '12px 15px', fontSize: '0.85rem', color: '#4b5563' }}>Produto</th>
                    
                    {tipoRelatorio === 'mais_vendidos' ? (
                      <>
                        <th style={{ padding: '12px 15px', fontSize: '0.85rem', color: '#4b5563', textAlign: 'right' }}>Qtd Vendida</th>
                        <th style={{ padding: '12px 15px', fontSize: '0.85rem', color: '#4b5563', textAlign: 'right' }}>Faturamento</th>
                      </>
                    ) : (
                      <>
                        <th style={{ padding: '12px 15px', fontSize: '0.85rem', color: '#4b5563', textAlign: 'center' }}>Estoque</th>
                        <th style={{ padding: '12px 15px', fontSize: '0.85rem', color: '#4b5563' }}>Validade</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {dadosRelatorioAtual.length === 0 ? (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>Nenhum dado encontrado para este filtro.</td></tr>
                  ) : (
                    dadosRelatorioAtual.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '12px 15px', fontSize: '0.85rem', color: '#6b7280' }}>{tipoRelatorio === 'mais_vendidos' ? row.codigo : row.codigo_interno}</td>
                        <td style={{ padding: '12px 15px', fontSize: '0.9rem', color: '#374151', fontWeight: '600' }}>{tipoRelatorio === 'mais_vendidos' ? row.nome : row.descricao}</td>
                        
                        {tipoRelatorio === 'mais_vendidos' ? (
                          <>
                            <td style={{ padding: '12px 15px', fontSize: '0.9rem', color: '#4f46e5', fontWeight: 'bold', textAlign: 'right' }}>{row.qtd}x</td>
                            <td style={{ padding: '12px 15px', fontSize: '0.9rem', color: '#10b981', fontWeight: 'bold', textAlign: 'right' }}>{formatarMoeda(row.total)}</td>
                          </>
                        ) : (
                          <>
                            <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                              <span style={{ backgroundColor: row.estoque <= 0 ? '#fef2f2' : row.estoque <= 5 ? '#fffbeb' : '#ecfdf5', color: row.estoque <= 0 ? '#ef4444' : row.estoque <= 5 ? '#d97706' : '#10b981', padding: '4px 10px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.8rem' }}>
                                {row.estoque} un
                              </span>
                            </td>
                            <td style={{ padding: '12px 15px', fontSize: '0.85rem', color: '#ef4444', fontWeight: 'bold' }}>
                              {row.validade ? new Date(row.validade).toLocaleDateString('pt-BR') : '-'}
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}