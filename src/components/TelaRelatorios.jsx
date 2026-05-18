import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { 
  BarChart3, FileText, Download, Printer, TrendingUp, TrendingDown, Search 
} from 'lucide-react';

export default function TelaRelatorios() {
  const [abaAtiva, setAbaAtiva] = useState('dashboard'); // 'dashboard' ou 'relatorios'
  const [loading, setLoading] = useState(true);
  
  // Datas Padrão (Mês Corrente)
  const hoje = new Date();
  const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
  const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0];

  // ==========================================
  // ESTADOS DO DASHBOARD
  // ==========================================
  const [dataInicioDash, setDataInicioDash] = useState(primeiroDiaMes);
  const [dataFimDash, setDataFimDash] = useState(ultimoDiaMes);
  const [buscandoDash, setBuscandoDash] = useState(false);
  const [lancamentosDash, setLancamentosDash] = useState([]);
  const [lancamentosGrafico, setLancamentosGrafico] = useState([]);
  const [detalheGrafico, setDetalheGrafico] = useState(null);

  // ==========================================
  // ESTADOS DOS RELATÓRIOS
  // ==========================================
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [formasPagamento, setFormasPagamento] = useState([]);
  
  const [tipoRelatorio, setTipoRelatorio] = useState('fluxo_caixa'); // Pode mudar o padrão se quiser
  const [dataInicioRel, setDataInicioRel] = useState(primeiroDiaMes);
  const [dataFimRel, setDataFimRel] = useState(ultimoDiaMes);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState('');
  
  const [dadosRelatorio, setDadosRelatorio] = useState([]);
  const [gerandoRelatorio, setGerandoRelatorio] = useState(false);
  const [erroRelatorio, setErroRelatorio] = useState('');
  
  // Controle de Ordenação da Tabela
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    carregarDadosBase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function carregarDadosBase() {
    setLoading(true);
    
    // Busca listas auxiliares
    const { data: prodData } = await supabase.from('produtos').select('*');
    if (prodData) setProdutos(prodData);

    const { data: catData } = await supabase.from('categorias').select('*').order('nome');
    if (catData) setCategorias(catData);

    const { data: pagData } = await supabase.from('formas_pagamento').select('*').order('nome');
    if (pagData) setFormasPagamento(pagData);

    // Carrega dados iniciais do Dashboard
    await buscarLancamentosDash(primeiroDiaMes, ultimoDiaMes);
    await carregarDadosGrafico();

    setLoading(false);
  }

  // ==========================================
  // FUNÇÕES DO DASHBOARD
  // ==========================================
  async function carregarDadosGrafico() {
    const d = new Date();
    d.setDate(d.getDate() - 6); 
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0).toISOString();
    
    const { data } = await supabase.from('lancamentos')
      .select('tipo, valor, data_hora')
      .gte('data_hora', start);
      
    if (data) setLancamentosGrafico(data);
  }

  async function buscarLancamentosDash(inicio, fim) {
    setBuscandoDash(true);
    const start = new Date(`${inicio}T00:00:00-03:00`).toISOString();
    const end = new Date(`${fim}T23:59:59.999-03:00`).toISOString();
    
    const { data } = await supabase.from('lancamentos')
      .select('*')
      .gte('data_hora', start)
      .lte('data_hora', end);

    if (data) setLancamentosDash(data);
    setBuscandoDash(false);
  }

  const totalEntradas = lancamentosDash.filter(l => l.tipo === 'ENTRADA' || l.tipo === 'REFORCO').reduce((acc, l) => acc + Number(l.valor), 0);
  const totalSaidas = lancamentosDash.filter(l => l.tipo === 'SAIDA' || l.tipo === 'SANGRIA').reduce((acc, l) => acc + Number(l.valor), 0);
  const saldoLiquido = totalEntradas - totalSaidas;

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

  const maiorValorGrafico = Math.max(...ultimos7Dias.map(d => Math.max(d.entradas, d.saidas, 1)));

  // ==========================================
  // GERADOR DE RELATÓRIOS DINÂMICOS
  // ==========================================
  async function handleGerarRelatorio() {
    setErroRelatorio('');
    if (tipoRelatorio === 'categoria' && !categoriaSelecionada) {
      setErroRelatorio('Por favor, selecione uma categoria para gerar o relatório.');
      return;
    }
    if (tipoRelatorio === 'pagamento' && !pagamentoSelecionado) {
      setErroRelatorio('Por favor, selecione uma forma de pagamento.');
      return;
    }

    setGerandoRelatorio(true);
    setDadosRelatorio([]); // Limpa a tabela
    setSortConfig({ key: null, direction: 'asc' }); // Reseta ordenação

    const start = new Date(`${dataInicioRel}T00:00:00-03:00`).toISOString();
    const end = new Date(`${dataFimRel}T23:59:59.999-03:00`).toISOString();
    let resultado = [];

    try {
      if (['mais_vendidos', 'menos_vendidos', 'categoria'].includes(tipoRelatorio)) {
        const { data: itens } = await supabase.from('itens_venda')
          .select('produto_id, quantidade, subtotal, produtos(descricao, codigo_interno, categoria_id), lancamentos!inner(data_hora)')
          .gte('lancamentos.data_hora', start)
          .lte('lancamentos.data_hora', end);

        let itensFiltrados = itens || [];
        if (tipoRelatorio === 'categoria') {
          itensFiltrados = itensFiltrados.filter(i => i.produtos && String(i.produtos.categoria_id) === String(categoriaSelecionada));
        }

        const mapaVendas = {};
        if (tipoRelatorio === 'menos_vendidos') {
          // Para os menos vendidos, injeta todos os produtos com 0 inicialmente
          produtos.forEach(p => {
            mapaVendas[p.id] = { id: p.id, codigo: p.codigo_interno, nome: p.descricao, qtd: 0, total: 0 };
          });
        }

        itensFiltrados.forEach(item => {
          if (!mapaVendas[item.produto_id]) {
             mapaVendas[item.produto_id] = { id: item.produto_id, codigo: item.produtos?.codigo_interno, nome: item.produtos?.descricao, qtd: 0, total: 0 };
          }
          mapaVendas[item.produto_id].qtd += item.quantidade;
          mapaVendas[item.produto_id].total += item.subtotal;
        });

        resultado = Object.values(mapaVendas);

        if (tipoRelatorio === 'mais_vendidos' || tipoRelatorio === 'categoria') {
          resultado = resultado.sort((a, b) => b.qtd - a.qtd).filter(r => r.qtd > 0);
        } else if (tipoRelatorio === 'menos_vendidos') {
          resultado = resultado.sort((a, b) => a.qtd - b.qtd);
        }
      } 
      else if (tipoRelatorio === 'pagamento' || tipoRelatorio === 'fluxo_caixa') {
        let query = supabase.from('lancamentos')
          .select('id, data_hora, descricao, valor, forma_pagamento, tipo, caixas_sessoes(usuarios(nome))')
          .gte('data_hora', start)
          .lte('data_hora', end)
          .order('data_hora', { ascending: false });

        // Se for o relatório específico de pagamento, filtra. Se for fluxo_caixa, traz todos.
        if (tipoRelatorio === 'pagamento') {
          query = query.eq('forma_pagamento', pagamentoSelecionado);
        }

        const { data: lancs } = await query;

        if (lancs) {
          resultado = lancs.map(l => ({
            id: l.id, 
            data_hora: l.data_hora, 
            descricao: l.descricao, 
            tipo: l.tipo, 
            valor: l.valor, 
            forma: l.forma_pagamento || 'N/A',
            operador: l.caixas_sessoes?.usuarios?.nome || 'Desconhecido'
          }));
        }
      }
      else if (tipoRelatorio === 'estoque_zero') {
        resultado = produtos.filter(p => p.estoque <= 0).map(p => ({
          codigo: p.codigo_interno, nome: p.descricao, estoque: p.estoque, validade: p.validade
        }));
      }
      else if (tipoRelatorio === 'estoque_minimo') {
        resultado = produtos.filter(p => p.estoque > 0 && p.estoque <= 5).map(p => ({
          codigo: p.codigo_interno, nome: p.descricao, estoque: p.estoque, validade: p.validade
        }));
      }
      else if (tipoRelatorio === 'validade') {
        resultado = produtos.filter(p => {
          if (!p.validade) return false;
          const v = new Date(`${p.validade}T12:00:00`);
          return v >= new Date(`${dataInicioRel}T00:00:00`) && v <= new Date(`${dataFimRel}T23:59:59`);
        }).map(p => ({
          codigo: p.codigo_interno, nome: p.descricao, estoque: p.estoque, validade: p.validade
        }));
      }

      setDadosRelatorio(resultado);
    } catch (error) {
      console.error(error);
      setErroRelatorio('Ocorreu um erro ao gerar os dados.');
    }

    setGerandoRelatorio(false);
  }

  // ==========================================
  // ORDENAÇÃO DE TABELA (SORTING)
  // ==========================================
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const dadosOrdenados = useMemo(() => {
    let sortableItems = [...dadosRelatorio];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (valA === null || valA === undefined) valA = '';
        if (valB === null || valB === undefined) valB = '';

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [dadosRelatorio, sortConfig]);

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <span style={{ opacity: 0.2, marginLeft: '5px', fontSize: '0.7rem' }}>⇅</span>;
    return sortConfig.direction === 'asc' ? <span style={{ marginLeft: '5px', fontSize: '0.7rem', color: '#4f46e5' }}>▲</span> : <span style={{ marginLeft: '5px', fontSize: '0.7rem', color: '#4f46e5' }}>▼</span>;
  };

  // ==========================================
  // EXPORTAÇÃO E IMPRESSÃO
  // ==========================================
  const formatarMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const imprimirPDF = () => {
    window.print();
  };

  const exportarExcel = () => {
    if (dadosRelatorio.length === 0) return;

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; 
    
    if (['mais_vendidos', 'menos_vendidos', 'categoria'].includes(tipoRelatorio)) {
      csvContent += "Codigo,Produto,Qtd Vendida,Faturamento\r\n";
      dadosOrdenados.forEach(r => { csvContent += `"${r.codigo}","${r.nome}",${r.qtd},${r.total}\r\n`; });
    } else if (tipoRelatorio === 'pagamento') {
      csvContent += "Data/Hora,Descricao,Tipo,Valor\r\n";
      dadosOrdenados.forEach(r => { csvContent += `"${new Date(r.data_hora).toLocaleString('pt-BR')}","${r.descricao}","${r.tipo}",${r.valor}\r\n`; });
    } else if (tipoRelatorio === 'fluxo_caixa') {
      csvContent += "Data/Hora,Descricao,Tipo,Forma de Pagamento,Operador,Valor\r\n";
      dadosOrdenados.forEach(r => { csvContent += `"${new Date(r.data_hora).toLocaleString('pt-BR')}","${r.descricao}","${r.tipo}","${r.forma}","${r.operador}",${r.valor}\r\n`; });
    } else {
      csvContent += "Codigo,Produto,Estoque,Validade\r\n";
      dadosOrdenados.forEach(r => { csvContent += `"${r.codigo}","${r.nome}",${r.estoque},"${r.validade ? new Date(r.validade).toLocaleDateString('pt-BR') : '-'}"\r\n`; });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Relatorio_${tipoRelatorio}_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ==========================================
  // RENDERIZAÇÕES DE CABEÇALHOS DE TABELA
  // ==========================================
  const renderTableHeaders = () => {
    if (['mais_vendidos', 'menos_vendidos', 'categoria'].includes(tipoRelatorio)) {
      return (
        <tr>
          <th onClick={() => handleSort('codigo')} style={{ cursor: 'pointer', padding: '12px 15px' }}>Código <SortIcon columnKey="codigo" /></th>
          <th onClick={() => handleSort('nome')} style={{ cursor: 'pointer', padding: '12px 15px' }}>Produto <SortIcon columnKey="nome" /></th>
          <th onClick={() => handleSort('qtd')} style={{ cursor: 'pointer', padding: '12px 15px', textAlign: 'right' }}>Qtd Vendida <SortIcon columnKey="qtd" /></th>
          <th onClick={() => handleSort('total')} style={{ cursor: 'pointer', padding: '12px 15px', textAlign: 'right' }}>Valor <SortIcon columnKey="total" /></th>
        </tr>
      );
    } else if (tipoRelatorio === 'pagamento' || tipoRelatorio === 'fluxo_caixa') {
      return (
        <tr>
          <th onClick={() => handleSort('data_hora')} style={{ cursor: 'pointer', padding: '12px 15px' }}>Data/Hora <SortIcon columnKey="data_hora" /></th>
          <th onClick={() => handleSort('descricao')} style={{ cursor: 'pointer', padding: '12px 15px' }}>Descrição <SortIcon columnKey="descricao" /></th>
          <th onClick={() => handleSort('tipo')} style={{ cursor: 'pointer', padding: '12px 15px', textAlign: 'center' }}>Tipo <SortIcon columnKey="tipo" /></th>
          {tipoRelatorio === 'fluxo_caixa' && <th onClick={() => handleSort('forma')} style={{ cursor: 'pointer', padding: '12px 15px' }}>Pagamento <SortIcon columnKey="forma" /></th>}
          {tipoRelatorio === 'fluxo_caixa' && <th onClick={() => handleSort('operador')} style={{ cursor: 'pointer', padding: '12px 15px' }}>Operador <SortIcon columnKey="operador" /></th>}
          <th onClick={() => handleSort('valor')} style={{ cursor: 'pointer', padding: '12px 15px', textAlign: 'right' }}>Valor <SortIcon columnKey="valor" /></th>
        </tr>
      );
    } else {
      return (
        <tr>
          <th onClick={() => handleSort('codigo')} style={{ cursor: 'pointer', padding: '12px 15px' }}>Código <SortIcon columnKey="codigo" /></th>
          <th onClick={() => handleSort('nome')} style={{ cursor: 'pointer', padding: '12px 15px' }}>Produto <SortIcon columnKey="nome" /></th>
          <th onClick={() => handleSort('estoque')} style={{ cursor: 'pointer', padding: '12px 15px', textAlign: 'center' }}>Estoque <SortIcon columnKey="estoque" /></th>
          <th onClick={() => handleSort('validade')} style={{ cursor: 'pointer', padding: '12px 15px' }}>Validade <SortIcon columnKey="validade" /></th>
        </tr>
      );
    }
  };

  const renderTableBody = () => {
    if (dadosOrdenados.length === 0) {
      return <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>Nenhum dado encontrado para este período/filtro.</td></tr>;
    }

    return dadosOrdenados.map((row, idx) => {
      if (['mais_vendidos', 'menos_vendidos', 'categoria'].includes(tipoRelatorio)) {
        return (
          <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
            <td style={{ padding: '12px 15px', fontSize: '0.85rem', color: '#6b7280' }}>{row.codigo}</td>
            <td style={{ padding: '12px 15px', fontSize: '0.9rem', color: '#374151', fontWeight: '600' }}>{row.nome}</td>
            <td style={{ padding: '12px 15px', fontSize: '0.9rem', color: '#4f46e5', fontWeight: 'bold', textAlign: 'right' }}>{row.qtd}x</td>
            <td style={{ padding: '12px 15px', fontSize: '0.9rem', color: '#10b981', fontWeight: 'bold', textAlign: 'right' }}>{formatarMoeda(row.total)}</td>
          </tr>
        );
      } else if (tipoRelatorio === 'pagamento' || tipoRelatorio === 'fluxo_caixa') {
        const isEntrada = row.tipo === 'ENTRADA' || row.tipo === 'REFORCO';
        return (
          <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
            <td style={{ padding: '12px 15px', fontSize: '0.85rem', color: '#6b7280' }}>{new Date(row.data_hora).toLocaleString('pt-BR')}</td>
            <td style={{ padding: '12px 15px', fontSize: '0.9rem', color: '#374151', fontWeight: '600' }}>{row.descricao}</td>
            <td style={{ padding: '12px 15px', textAlign: 'center' }}>
               <span style={{ backgroundColor: isEntrada ? '#ecfdf5' : '#fef2f2', color: isEntrada ? '#10b981' : '#ef4444', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>{row.tipo}</span>
            </td>
            {tipoRelatorio === 'fluxo_caixa' && <td style={{ padding: '12px 15px', fontSize: '0.85rem', color: '#6b7280' }}>{row.forma}</td>}
            {tipoRelatorio === 'fluxo_caixa' && <td style={{ padding: '12px 15px', fontSize: '0.85rem', color: '#6b7280' }}>{row.operador}</td>}
            <td style={{ padding: '12px 15px', fontSize: '0.9rem', color: isEntrada ? '#10b981' : '#ef4444', fontWeight: 'bold', textAlign: 'right' }}>
              {isEntrada ? '+' : '-'}{formatarMoeda(row.valor)}
            </td>
          </tr>
        );
      } else {
        return (
          <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
            <td style={{ padding: '12px 15px', fontSize: '0.85rem', color: '#6b7280' }}>{row.codigo}</td>
            <td style={{ padding: '12px 15px', fontSize: '0.9rem', color: '#374151', fontWeight: '600' }}>{row.nome}</td>
            <td style={{ padding: '12px 15px', textAlign: 'center' }}>
              <span style={{ backgroundColor: row.estoque <= 0 ? '#fef2f2' : row.estoque <= 5 ? '#fffbeb' : '#ecfdf5', color: row.estoque <= 0 ? '#ef4444' : row.estoque <= 5 ? '#d97706' : '#10b981', padding: '4px 10px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.8rem' }}>
                {row.estoque} un
              </span>
            </td>
            <td style={{ padding: '12px 15px', fontSize: '0.85rem', color: '#ef4444', fontWeight: 'bold' }}>
              {row.validade ? new Date(`${row.validade}T12:00:00`).toLocaleDateString('pt-BR') : '-'}
            </td>
          </tr>
        );
      }
    });
  };

  const tituloDoRelatorio = {
    'fluxo_caixa': 'Fluxo de Caixa (Lançamentos do Período)',
    'mais_vendidos': 'Produtos Mais Vendidos',
    'menos_vendidos': 'Produtos Menos Vendidos',
    'categoria': 'Vendas por Categoria',
    'pagamento': 'Lançamentos por Forma de Pagamento',
    'estoque_zero': 'Produtos Sem Estoque (Zerados)',
    'estoque_minimo': 'Alerta de Estoque Mínimo',
    'validade': 'Controle de Validades no Período'
  }[tipoRelatorio];

  const printStyles = `
    .apenas-impressao { display: none; }
    
    @media print {
      @page { margin: 10mm; }
      body, html { background-color: #ffffff !important; }
      body * { visibility: hidden; }
      
      #area-impressao, #area-impressao * { visibility: visible; }
      #area-impressao { 
        position: absolute; 
        left: 0; 
        top: 0; 
        width: 100%; 
        background-color: #ffffff !important; 
        margin: 0; 
        padding: 0; 
      }
      
      .apenas-impressao { display: block !important; }
      .no-print { display: none !important; }
      
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #d1d5db !important; padding: 10px !important; color: #111827 !important; }
      th { background-color: #f3f4f6 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
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
      )}

      {/* ==================================================== */}
      {/* MODO 2: LISTAS E EXPORTAÇÃO                        */}
      {/* ==================================================== */}
      {abaAtiva === 'relatorios' && (
        <div>
          <div className="no-print" style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '20px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4b5563', display: 'block', marginBottom: '5px' }}>Tipo de Relatório:</label>
                <select value={tipoRelatorio} onChange={(e) => { setTipoRelatorio(e.target.value); setDadosRelatorio([]); }} className="input-padrao" style={{ margin: 0, backgroundColor: 'white' }}>
                  <option value="fluxo_caixa">Fluxo de Caixa (Lançamentos do Período)</option>
                  <option value="mais_vendidos">Produtos Mais Vendidos</option>
                  <option value="menos_vendidos">Produtos Menos Vendidos</option>
                  <option value="categoria">Vendas por Categoria</option>
                  <option value="pagamento">Lançamentos por Forma de Pagamento</option>
                  <option value="estoque_zero">Produtos Sem Estoque (Zerados)</option>
                  <option value="estoque_minimo">Alerta de Estoque Mínimo</option>
                  <option value="validade">Controle de Validades do Período</option>
                </select>
              </div>

              {tipoRelatorio === 'categoria' && (
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4b5563', display: 'block', marginBottom: '5px' }}>Categoria Específica:</label>
                  <select value={categoriaSelecionada} onChange={(e) => setCategoriaSelecionada(e.target.value)} className="input-padrao" style={{ margin: 0, backgroundColor: 'white' }}>
                    <option value="">Selecione...</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
              )}

              {tipoRelatorio === 'pagamento' && (
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4b5563', display: 'block', marginBottom: '5px' }}>Forma de Pagamento:</label>
                  <select value={pagamentoSelecionado} onChange={(e) => setPagamentoSelecionado(e.target.value)} className="input-padrao" style={{ margin: 0, backgroundColor: 'white' }}>
                    <option value="">Selecione...</option>
                    {formasPagamento.map(f => <option key={f.id} value={f.nome}>{f.nome}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4b5563', display: 'block', marginBottom: '5px' }}>Data Inicial:</label>
                <input type="date" value={dataInicioRel} onChange={e => setDataInicioRel(e.target.value)} className="input-padrao" style={{ margin: 0 }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4b5563', display: 'block', marginBottom: '5px' }}>Data Final:</label>
                <input type="date" value={dataFimRel} onChange={e => setDataFimRel(e.target.value)} className="input-padrao" style={{ margin: 0 }} />
              </div>
            </div>

            {erroRelatorio && <p style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '15px', textAlign: 'center' }}>{erroRelatorio}</p>}

            <button onClick={handleGerarRelatorio} className="btn-entrada" disabled={gerandoRelatorio} style={{ width: '100%', margin: 0, backgroundColor: '#4f46e5' }}>
              {gerandoRelatorio ? 'PROCESSANDO...' : 'GERAR RELATÓRIO'}
            </button>

            {dadosRelatorio.length > 0 && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button onClick={imprimirPDF} className="btn-entrada" style={{ flex: 1, margin: 0, backgroundColor: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Printer size="18" /> IMPRIMIR / PDF
                </button>
                <button onClick={exportarExcel} className="btn-secundario" style={{ flex: 1, margin: 0, color: '#047857', borderColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Download size="18" /> SALVAR EXCEL
                </button>
              </div>
            )}
          </div>

          {/* ÁREA QUE SERÁ IMPRESSA */}
          <div id="area-impressao">
            
            {/* CABEÇALHO DO PDF INVISÍVEL NA WEB, VISÍVEL NO PDF */}
            <div className="apenas-impressao" style={{ marginBottom: '30px', textAlign: 'center', backgroundColor: 'white', padding: '20px 0' }}>
              <h1 style={{ color: '#111827', margin: '0 0 8px 0', fontSize: '2.2rem', fontWeight: '900', letterSpacing: '-0.5px' }}>MINI MERCADO FEITOSA</h1>
              <h2 style={{ color: '#4b5563', margin: '0 0 10px 0', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {tituloDoRelatorio}
              </h2>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '25px', color: '#6b7280', fontSize: '0.9rem' }}>
                <span><strong>Período:</strong> {new Date(`${dataInicioRel}T12:00:00`).toLocaleDateString('pt-BR')} a {new Date(`${dataFimRel}T12:00:00`).toLocaleDateString('pt-BR')}</span>
                <span><strong>Emissão:</strong> {new Date().toLocaleString('pt-BR')}</span>
              </div>
              <hr style={{ marginTop: '20px', border: 'none', borderTop: '2px solid #e5e7eb' }}/>
            </div>

            <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                  {renderTableHeaders()}
                </thead>
                <tbody>
                  {renderTableBody()}
                </tbody>
              </table>
            </div>
            
          </div>
        </div>
      )}
    </main>
  );
}