import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { 
  BarChart3, FileText, Printer, TrendingUp, TrendingDown, Search 
} from 'lucide-react';

export default function TelaRelatorios() {
  const [loading, setLoading] = useState(true);
  
  // Datas Padrão (Mês Corrente)
  const hoje = new Date();
  const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
  const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0];

  // ==========================================
  // ESTADOS DOS RELATÓRIOS
  // ==========================================
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [formasPagamento, setFormasPagamento] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [usuarios, setUsuarios] = useState([]); 
  
  const [tipoRelatorio, setTipoRelatorio] = useState('fluxo_caixa'); 
  const [dataInicioRel, setDataInicioRel] = useState(primeiroDiaMes);
  const [dataFimRel, setDataFimRel] = useState(ultimoDiaMes);
  
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('todos');
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState('todos');
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState('todos');
  const [usuarioSelecionado, setUsuarioSelecionado] = useState('todos');
  
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
    
    const { data: prodData } = await supabase.from('produtos').select('*');
    if (prodData) setProdutos(prodData);

    const { data: catData } = await supabase.from('categorias').select('*').order('nome');
    if (catData) setCategorias(catData);

    const { data: pagData } = await supabase.from('formas_pagamento').select('*').order('nome');
    if (pagData) setFormasPagamento(pagData);

    const { data: fornData } = await supabase.from('fornecedores').select('*').order('nome');
    if (fornData) setFornecedores(fornData);

    const { data: userData } = await supabase.from('usuarios').select('*').eq('ativo', true).order('nome');
    if (userData) setUsuarios(userData);

    setLoading(false);
  }

  // ==========================================
  // GERADOR DE RELATÓRIOS DINÂMICOS
  // ==========================================
  async function handleGerarRelatorio() {
    setErroRelatorio('');
    setGerandoRelatorio(true);
    setDadosRelatorio([]); 
    setSortConfig({ key: null, direction: 'asc' }); 

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
        if (tipoRelatorio === 'categoria' && categoriaSelecionada !== 'todos') {
          itensFiltrados = itensFiltrados.filter(i => i.produtos && String(i.produtos.categoria_id) === String(categoriaSelecionada));
        }

        const mapaVendas = {};
        
        if (tipoRelatorio === 'menos_vendidos') {
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

        if (tipoRelatorio === 'pagamento' && pagamentoSelecionado !== 'todos') {
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

          if (tipoRelatorio === 'pagamento' && pagamentoSelecionado === 'todos') {
            resultado.sort((a, b) => a.forma.localeCompare(b.forma));
          }
        }
      }
      else if (tipoRelatorio === 'caixas_sessoes') {
        let query = supabase.from('caixas_sessoes')
          .select(`
            id, data_abertura, data_fechamento, valor_abertura, valor_fechamento, status,
            usuarios(nome),
            lancamentos(tipo, valor, forma_pagamento)
          `)
          .gte('data_abertura', start)
          .lte('data_abertura', end)
          .order('data_abertura', { ascending: false });

        if (usuarioSelecionado !== 'todos') {
          query = query.eq('usuario_id', usuarioSelecionado);
        }

        const { data: sessoes } = await query;
        if (sessoes) {
          resultado = sessoes.map(s => {
            let dinheiro = 0;
            let pix = 0;
            let cartoes = 0;
            let saidas = 0;

            (s.lancamentos || []).forEach(l => {
              const val = Number(l.valor) || 0;
              if (l.tipo === 'ENTRADA' || l.tipo === 'REFORCO') {
                const fp = (l.forma_pagamento || '').toUpperCase();
                if (fp.includes('DINHEIRO') || l.tipo === 'REFORCO') dinheiro += val;
                else if (fp.includes('PIX')) pix += val;
                else if (fp.includes('CRÉDITO') || fp.includes('CREDITO') || fp.includes('DÉBITO') || fp.includes('DEBITO')) cartoes += val;
                else dinheiro += val; 
              } else if (l.tipo === 'SAIDA' || l.tipo === 'SANGRIA') {
                saidas += val;
              }
            });

            const abertura = Number(s.valor_abertura) || 0;
            const esperado = abertura + dinheiro - saidas;
            const fechamento = s.status === 'FECHADO' ? (Number(s.valor_fechamento) || 0) : null;
            const quebra = s.status === 'FECHADO' ? fechamento - esperado : null;

            return {
              id: s.id,
              operador: s.usuarios?.nome || 'Desconhecido',
              data_abertura: s.data_abertura,
              data_fechamento: s.data_fechamento,
              status: s.status,
              abertura: abertura,
              dinheiro: dinheiro,
              pix: pix,
              cartoes: cartoes,
              saidas: saidas,
              esperado: esperado,
              fechamento: fechamento,
              quebra: quebra
            };
          });
        }
      }
      else if (tipoRelatorio === 'fornecedor') {
        let query = supabase.from('produtos').select('codigo_interno, descricao, estoque, preco, fornecedores(nome)');
        
        if (fornecedorSelecionado !== 'todos') {
          query = query.eq('fornecedor_id', fornecedorSelecionado);
        }

        const { data: prods } = await query;
        if (prods) {
          resultado = prods.map(p => ({
            codigo: p.codigo_interno, 
            nome: p.descricao, 
            fornecedor: p.fornecedores?.nome || 'Sem Fornecedor',
            estoque: p.estoque, 
            preco: p.preco,
            valor_total: p.estoque * p.preco
          }));
          
          if (fornecedorSelecionado === 'todos') {
             resultado.sort((a, b) => a.fornecedor.localeCompare(b.fornecedor));
          }
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
        })).sort((a, b) => new Date(a.validade) - new Date(b.validade));
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

  const formatarMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const imprimirPDF = () => window.print();

  // ==========================================
  // RENDERIZAÇÕES DINÂMICAS DE TABELA
  // ==========================================
  const renderTableHeaders = () => {
    if (['mais_vendidos', 'menos_vendidos', 'categoria'].includes(tipoRelatorio)) {
      return (
        <tr>
          <th onClick={() => handleSort('codigo')} style={{ cursor: 'pointer', padding: '12px 15px' }}>Código <SortIcon columnKey="codigo" /></th>
          <th onClick={() => handleSort('nome')} style={{ cursor: 'pointer', padding: '12px 15px' }}>Produto <SortIcon columnKey="nome" /></th>
          <th onClick={() => handleSort('qtd')} style={{ cursor: 'pointer', padding: '12px 15px', textAlign: 'center' }}>Qtd Vendida <SortIcon columnKey="qtd" /></th>
          <th onClick={() => handleSort('total')} style={{ cursor: 'pointer', padding: '12px 15px', textAlign: 'right' }}>Faturamento <SortIcon columnKey="total" /></th>
        </tr>
      );
    } else if (tipoRelatorio === 'pagamento' || tipoRelatorio === 'fluxo_caixa') {
      return (
        <tr>
          <th onClick={() => handleSort('data_hora')} style={{ cursor: 'pointer', padding: '12px 15px' }}>Data/Hora <SortIcon columnKey="data_hora" /></th>
          <th onClick={() => handleSort('descricao')} style={{ cursor: 'pointer', padding: '12px 15px' }}>Descrição <SortIcon columnKey="descricao" /></th>
          <th onClick={() => handleSort('tipo')} style={{ cursor: 'pointer', padding: '12px 15px', textAlign: 'center' }}>Tipo <SortIcon columnKey="tipo" /></th>
          <th onClick={() => handleSort('forma')} style={{ cursor: 'pointer', padding: '12px 15px' }}>Pagamento <SortIcon columnKey="forma" /></th>
          {tipoRelatorio === 'fluxo_caixa' && <th onClick={() => handleSort('operador')} style={{ cursor: 'pointer', padding: '12px 15px' }}>Operador <SortIcon columnKey="operador" /></th>}
          <th onClick={() => handleSort('valor')} style={{ cursor: 'pointer', padding: '12px 15px', textAlign: 'right' }}>Valor <SortIcon columnKey="valor" /></th>
        </tr>
      );
    } else if (tipoRelatorio === 'caixas_sessoes') {
      return (
        <tr>
          <th onClick={() => handleSort('operador')} style={{ cursor: 'pointer', padding: '12px 10px' }}>Operador <SortIcon columnKey="operador" /></th>
          <th onClick={() => handleSort('data_abertura')} style={{ cursor: 'pointer', padding: '12px 10px' }}>Abertura <SortIcon columnKey="data_abertura" /></th>
          <th onClick={() => handleSort('data_fechamento')} style={{ cursor: 'pointer', padding: '12px 10px' }}>Fechamento <SortIcon columnKey="data_fechamento" /></th>
          <th onClick={() => handleSort('abertura')} style={{ cursor: 'pointer', padding: '12px 10px', textAlign: 'right' }}>Fundo <SortIcon columnKey="abertura" /></th>
          <th onClick={() => handleSort('dinheiro')} style={{ cursor: 'pointer', padding: '12px 10px', textAlign: 'right' }}>Dinheiro <SortIcon columnKey="dinheiro" /></th>
          <th onClick={() => handleSort('pix')} style={{ cursor: 'pointer', padding: '12px 10px', textAlign: 'right' }}>Pix <SortIcon columnKey="pix" /></th>
          <th onClick={() => handleSort('cartoes')} style={{ cursor: 'pointer', padding: '12px 10px', textAlign: 'right' }}>Cartões <SortIcon columnKey="cartoes" /></th>
          <th onClick={() => handleSort('saidas')} style={{ cursor: 'pointer', padding: '12px 10px', textAlign: 'right' }}>Saídas <SortIcon columnKey="saidas" /></th>
          <th onClick={() => handleSort('quebra')} style={{ cursor: 'pointer', padding: '12px 10px', textAlign: 'right' }}>Quebra <SortIcon columnKey="quebra" /></th>
        </tr>
      );
    } else if (tipoRelatorio === 'fornecedor') {
      return (
        <tr>
          <th onClick={() => handleSort('codigo')} style={{ cursor: 'pointer', padding: '12px 15px' }}>Código <SortIcon columnKey="codigo" /></th>
          <th onClick={() => handleSort('nome')} style={{ cursor: 'pointer', padding: '12px 15px' }}>Produto <SortIcon columnKey="nome" /></th>
          <th onClick={() => handleSort('fornecedor')} style={{ cursor: 'pointer', padding: '12px 15px' }}>Fornecedor <SortIcon columnKey="fornecedor" /></th>
          <th onClick={() => handleSort('estoque')} style={{ cursor: 'pointer', padding: '12px 15px', textAlign: 'center' }}>Estoque <SortIcon columnKey="estoque" /></th>
          <th onClick={() => handleSort('preco')} style={{ cursor: 'pointer', padding: '12px 15px', textAlign: 'right' }}>Preço Unit. <SortIcon columnKey="preco" /></th>
          <th onClick={() => handleSort('valor_total')} style={{ cursor: 'pointer', padding: '12px 15px', textAlign: 'right' }}>Valor Total <SortIcon columnKey="valor_total" /></th>
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
      return <tr><td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>Nenhum dado encontrado para este período/filtro.</td></tr>;
    }

    return dadosOrdenados.map((row, idx) => {
      if (['mais_vendidos', 'menos_vendidos', 'categoria'].includes(tipoRelatorio)) {
        return (
          <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
            <td style={{ padding: '12px 15px', fontSize: '0.85rem', color: '#6b7280' }}>{row.codigo}</td>
            <td style={{ padding: '12px 15px', fontSize: '0.9rem', color: '#374151', fontWeight: '600' }}>{row.nome}</td>
            <td style={{ padding: '12px 15px', fontSize: '0.9rem', color: '#4f46e5', fontWeight: 'bold', textAlign: 'center' }}>{row.qtd}x</td>
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
            <td style={{ padding: '12px 15px', fontSize: '0.85rem', color: '#6b7280' }}>{row.forma}</td>
            {tipoRelatorio === 'fluxo_caixa' && <td style={{ padding: '12px 15px', fontSize: '0.85rem', color: '#6b7280' }}>{row.operador}</td>}
            <td style={{ padding: '12px 15px', fontSize: '0.9rem', color: isEntrada ? '#10b981' : '#ef4444', fontWeight: 'bold', textAlign: 'right' }}>
              {isEntrada ? '+' : '-'}{formatarMoeda(row.valor)}
            </td>
          </tr>
        );
      } else if (tipoRelatorio === 'caixas_sessoes') {
        return (
          <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
            <td style={{ padding: '12px 10px', fontSize: '0.85rem', color: '#374151', fontWeight: 'bold' }}>{row.operador}</td>
            <td style={{ padding: '12px 10px', fontSize: '0.8rem', color: '#6b7280' }}>{new Date(row.data_abertura).toLocaleString('pt-BR')}</td>
            <td style={{ padding: '12px 10px', fontSize: '0.8rem', color: '#6b7280' }}>
              {row.status === 'FECHADO' && row.data_fechamento ? new Date(row.data_fechamento).toLocaleString('pt-BR') : <span style={{ color: '#10b981', fontWeight: 'bold' }}>Em Aberto</span>}
            </td>
            <td style={{ padding: '12px 10px', fontSize: '0.85rem', textAlign: 'right', color: '#6b7280' }}>{formatarMoeda(row.abertura)}</td>
            <td style={{ padding: '12px 10px', fontSize: '0.85rem', textAlign: 'right', color: '#10b981' }}>{formatarMoeda(row.dinheiro)}</td>
            <td style={{ padding: '12px 10px', fontSize: '0.85rem', textAlign: 'right', color: '#0ea5e9' }}>{formatarMoeda(row.pix)}</td>
            <td style={{ padding: '12px 10px', fontSize: '0.85rem', textAlign: 'right', color: '#8b5cf6' }}>{formatarMoeda(row.cartoes)}</td>
            <td style={{ padding: '12px 10px', fontSize: '0.85rem', textAlign: 'right', color: '#ef4444' }}>{formatarMoeda(row.saidas)}</td>
            <td style={{ padding: '12px 10px', fontSize: '0.85rem', textAlign: 'right', fontWeight: 'bold', color: row.quebra === null ? '#9ca3af' : (row.quebra < 0 ? '#ef4444' : (row.quebra > 0 ? '#10b981' : '#6b7280')) }}>
              {row.status === 'FECHADO' ? formatarMoeda(row.quebra) : '-'}
            </td>
          </tr>
        );
      } else if (tipoRelatorio === 'fornecedor') {
        return (
          <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
            <td style={{ padding: '12px 15px', fontSize: '0.85rem', color: '#6b7280' }}>{row.codigo}</td>
            <td style={{ padding: '12px 15px', fontSize: '0.9rem', color: '#374151', fontWeight: '600' }}>{row.nome}</td>
            <td style={{ padding: '12px 15px', fontSize: '0.85rem', color: '#4f46e5' }}>{row.fornecedor}</td>
            <td style={{ padding: '12px 15px', textAlign: 'center' }}>
              <span style={{ backgroundColor: row.estoque <= 0 ? '#fef2f2' : '#ecfdf5', color: row.estoque <= 0 ? '#ef4444' : '#10b981', padding: '4px 10px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.8rem' }}>
                {row.estoque} un
              </span>
            </td>
            <td style={{ padding: '12px 15px', fontSize: '0.9rem', color: '#374151', textAlign: 'right' }}>{formatarMoeda(row.preco)}</td>
            <td style={{ padding: '12px 15px', fontSize: '0.9rem', color: '#10b981', fontWeight: 'bold', textAlign: 'right' }}>{formatarMoeda(row.valor_total)}</td>
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

  const renderTableFooter = () => {
    if (dadosOrdenados.length === 0) return null;

    if (['mais_vendidos', 'menos_vendidos', 'categoria'].includes(tipoRelatorio)) {
      const totalQtd = dadosOrdenados.reduce((acc, r) => acc + r.qtd, 0);
      const totalFaturamento = dadosOrdenados.reduce((acc, r) => acc + r.total, 0);
      return (
        <tfoot style={{ backgroundColor: '#f9fafb' }}>
          <tr>
            <td colSpan="2" style={{ padding: '12px 15px', fontWeight: 'bold', color: '#374151' }}>TOTAL ({dadosOrdenados.length} itens listados)</td>
            <td style={{ padding: '12px 15px', textAlign: 'center', fontWeight: 'bold', color: '#4f46e5' }}>{totalQtd}x</td>
            <td style={{ padding: '12px 15px', textAlign: 'right', fontWeight: 'bold', color: '#10b981' }}>{formatarMoeda(totalFaturamento)}</td>
          </tr>
        </tfoot>
      );
    } else if (tipoRelatorio === 'pagamento' || tipoRelatorio === 'fluxo_caixa') {
      const totalEntradasFiltro = dadosOrdenados.filter(r => r.tipo === 'ENTRADA' || r.tipo === 'REFORCO').reduce((a, b) => a + b.valor, 0);
      const totalSaidasFiltro = dadosOrdenados.filter(r => r.tipo === 'SAIDA' || r.tipo === 'SANGRIA').reduce((a, b) => a + b.valor, 0);
      const saldoLocal = totalEntradasFiltro - totalSaidasFiltro;
      const colSpan = tipoRelatorio === 'fluxo_caixa' ? 5 : 4;

      return (
        <tfoot style={{ backgroundColor: '#f9fafb' }}>
          <tr>
            <td colSpan={colSpan} style={{ padding: '12px 15px', fontWeight: 'bold', color: '#374151' }}>
              TOTAL ({dadosOrdenados.length} lançamentos) 
              <span style={{ color: '#10b981', marginLeft: '15px' }}>Entradas: {formatarMoeda(totalEntradasFiltro)}</span> 
              <span style={{ color: '#ef4444', marginLeft: '15px' }}>Saídas: {formatarMoeda(totalSaidasFiltro)}</span>
              <span style={{ color: saldoLocal >= 0 ? '#4f46e5' : '#ef4444', marginLeft: '15px' }}>Saldo: </span>
            </td>
            <td style={{ padding: '12px 15px', textAlign: 'right', fontWeight: '900', color: saldoLocal >= 0 ? '#4f46e5' : '#ef4444' }}>
              {formatarMoeda(saldoLocal)}
            </td>
          </tr>
        </tfoot>
      );
    } else if (tipoRelatorio === 'caixas_sessoes') {
      const totAbertura = dadosOrdenados.reduce((a, b) => a + b.abertura, 0);
      const totDinheiro = dadosOrdenados.reduce((a, b) => a + b.dinheiro, 0);
      const totPix = dadosOrdenados.reduce((a, b) => a + b.pix, 0);
      const totCartoes = dadosOrdenados.reduce((a, b) => a + b.cartoes, 0);
      const totSaidas = dadosOrdenados.reduce((a, b) => a + b.saidas, 0);
      const totQuebra = dadosOrdenados.reduce((a, b) => a + (b.quebra || 0), 0);

      return (
        <tfoot style={{ backgroundColor: '#f9fafb' }}>
          <tr>
            <td colSpan="3" style={{ padding: '12px 10px', fontWeight: 'bold', color: '#374151' }}>TOTAL ({dadosOrdenados.length} sessões)</td>
            <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 'bold', color: '#6b7280' }}>{formatarMoeda(totAbertura)}</td>
            <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 'bold', color: '#10b981' }}>{formatarMoeda(totDinheiro)}</td>
            <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 'bold', color: '#0ea5e9' }}>{formatarMoeda(totPix)}</td>
            <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 'bold', color: '#8b5cf6' }}>{formatarMoeda(totCartoes)}</td>
            <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 'bold', color: '#ef4444' }}>{formatarMoeda(totSaidas)}</td>
            <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 'bold', color: totQuebra < 0 ? '#ef4444' : '#10b981' }}>{formatarMoeda(totQuebra)}</td>
          </tr>
        </tfoot>
      );
    } else if (tipoRelatorio === 'fornecedor') {
      const totalEstoque = dadosOrdenados.reduce((acc, r) => acc + r.estoque, 0);
      const totalValor = dadosOrdenados.reduce((acc, r) => acc + r.valor_total, 0);
      return (
        <tfoot style={{ backgroundColor: '#f9fafb' }}>
          <tr>
            <td colSpan="3" style={{ padding: '12px 15px', fontWeight: 'bold', color: '#374151' }}>TOTAL ({dadosOrdenados.length} itens listados)</td>
            <td style={{ padding: '12px 15px', textAlign: 'center', fontWeight: 'bold', color: '#4f46e5' }}>{totalEstoque} un</td>
            <td style={{ padding: '12px 15px', textAlign: 'right' }}>-</td>
            <td style={{ padding: '12px 15px', textAlign: 'right', fontWeight: 'bold', color: '#10b981' }}>{formatarMoeda(totalValor)}</td>
          </tr>
        </tfoot>
      );
    } else {
      const totalEstoque = dadosOrdenados.reduce((acc, r) => acc + r.estoque, 0);
      return (
        <tfoot style={{ backgroundColor: '#f9fafb' }}>
          <tr>
            <td colSpan="2" style={{ padding: '12px 15px', fontWeight: 'bold', color: '#374151' }}>TOTAL ({dadosOrdenados.length} itens listados)</td>
            <td style={{ padding: '12px 15px', textAlign: 'center', fontWeight: 'bold', color: '#4f46e5' }}>{totalEstoque} un</td>
            <td style={{ padding: '12px 15px' }}></td>
          </tr>
        </tfoot>
      );
    }
  };

  const tituloDoRelatorio = {
    'fluxo_caixa': 'Fluxo de Caixa (Lançamentos Gerais do Período)',
    'caixas_sessoes': 'Relatório de Abertura e Fechamento de Caixa',
    'mais_vendidos': 'Produtos Mais Vendidos',
    'menos_vendidos': 'Produtos Menos Vendidos',
    'categoria': 'Vendas por Categoria',
    'fornecedor': 'Produtos por Fornecedor (Estoque & Valores)',
    'pagamento': 'Lançamentos por Forma de Pagamento',
    'estoque_zero': 'Produtos Sem Estoque (Zerados)',
    'estoque_minimo': 'Alerta de Estoque Mínimo',
    'validade': 'Controle de Validade do Produto'
  }[tipoRelatorio];

  const printStyles = `
    .apenas-impressao { display: none; }
    
    @media print {
      @page { margin: 10mm; }
      body, html { background-color: #ffffff !important; margin: 0; padding: 0; }
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
      
      table { border-collapse: collapse; width: 100%; margin-top: 15px; }
      th, td { border: 1px solid #d1d5db !important; padding: 10px !important; color: #111827 !important; }
      th { background-color: #ffffff !important; border-bottom: 2px solid #111827 !important; }
      tfoot td { background-color: #ffffff !important; border-top: 2px solid #111827 !important; font-weight: bold; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    }
  `;

  if (loading) {
    return <main className="tela" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Carregando dados...</main>;
  }

  return (
    <main className="tela" style={{ paddingBottom: '30px' }}>
      <style>{printStyles}</style>

      <h2 className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#4b5563', marginBottom: '20px' }}>
        <FileText size="28" /> RELATÓRIOS
      </h2>

      <div>
        <div className="no-print" style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '20px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4b5563', display: 'block', marginBottom: '5px' }}>Tipo de Relatório:</label>
              <select value={tipoRelatorio} onChange={(e) => { setTipoRelatorio(e.target.value); setDadosRelatorio([]); }} className="input-padrao" style={{ margin: 0, backgroundColor: 'white' }}>
                <option value="caixas_sessoes">Abertura e Fechamento de Caixa</option>

                <option value="fluxo_caixa">Fluxo de Caixa (Lançamentos Gerais)</option>

                <option value="mais_vendidos">Produtos Mais Vendidos</option>
                <option value="menos_vendidos">Produtos Menos Vendidos</option>
                <option value="fornecedor">Produtos por Fornecedor</option>
                <option value="estoque_zero">Produtos Sem Estoque (Zerados)</option>
                
                <option value="categoria">Vendas por Categoria</option>

                

                <option value="pagamento">Lançamentos por Forma de Pagamento</option>

                


                <option value="estoque_minimo">Alerta de Estoque Mínimo</option>

                <option value="validade">Controle de Validade do produto</option>
              </select>
            </div>

            {tipoRelatorio === 'categoria' && (
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4b5563', display: 'block', marginBottom: '5px' }}>Categoria Específica:</label>
                <select value={categoriaSelecionada} onChange={(e) => setCategoriaSelecionada(e.target.value)} className="input-padrao" style={{ margin: 0, backgroundColor: 'white' }}>
                  <option value="todos">TODAS AS CATEGORIAS</option>
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
            )}

            {tipoRelatorio === 'pagamento' && (
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4b5563', display: 'block', marginBottom: '5px' }}>Forma de Pagamento:</label>
                <select value={pagamentoSelecionado} onChange={(e) => setPagamentoSelecionado(e.target.value)} className="input-padrao" style={{ margin: 0, backgroundColor: 'white' }}>
                  <option value="todos">TODAS AS FORMAS</option>
                  {formasPagamento.map(f => <option key={f.id} value={f.nome}>{f.nome}</option>)}
                </select>
              </div>
            )}

            {tipoRelatorio === 'fornecedor' && (
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4b5563', display: 'block', marginBottom: '5px' }}>Fornecedor:</label>
                <select value={fornecedorSelecionado} onChange={(e) => setFornecedorSelecionado(e.target.value)} className="input-padrao" style={{ margin: 0, backgroundColor: 'white' }}>
                  <option value="todos">TODOS OS FORNECEDORES</option>
                  {fornecedores.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                </select>
              </div>
            )}

            {tipoRelatorio === 'caixas_sessoes' && (
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4b5563', display: 'block', marginBottom: '5px' }}>Operador (Usuário):</label>
                <select value={usuarioSelecionado} onChange={(e) => setUsuarioSelecionado(e.target.value)} className="input-padrao" style={{ margin: 0, backgroundColor: 'white' }}>
                  <option value="todos">TODOS OS USUÁRIOS</option>
                  {usuarios.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
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
        </div>

        {/* Título Visível Acima da Tabela na Web e Botão Impressão Lado a Lado */}
        {dadosRelatorio.length > 0 && (
          <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
            <h3 style={{ color: '#374151', fontSize: '1.2rem', margin: 0 }}>
              {tituloDoRelatorio}
            </h3>
            <button onClick={imprimirPDF} style={{ background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px', padding: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', color: '#4b5563' }} title="Imprimir Relatório">
              <Printer size="20" />
            </button>
          </div>
        )}

        {/* ÁREA QUE SERÁ IMPRESSA */}
        <div id="area-impressao">
          
          {/* CABEÇALHO DO PDF INVISÍVEL NA WEB, VISÍVEL NO PDF */}
          <div className="apenas-impressao" style={{ marginBottom: '20px', textAlign: 'center', backgroundColor: '#ffffff', padding: '20px 0' }}>
            <h1 style={{ color: '#111827', margin: '0 0 8px 0', fontSize: '24pt', fontWeight: '900', letterSpacing: '-0.5px' }}>MINI MERCADO FEITOSA</h1>
            <h2 style={{ color: '#4b5563', margin: '0 0 10px 0', fontSize: '14pt', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {tituloDoRelatorio}
            </h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '25px', color: '#6b7280', fontSize: '11pt' }}>
              <span><strong>Período:</strong> {new Date(`${dataInicioRel}T12:00:00`).toLocaleDateString('pt-BR')} a {new Date(`${dataFimRel}T12:00:00`).toLocaleDateString('pt-BR')}</span>
              <span><strong>Emissão:</strong> {new Date().toLocaleString('pt-BR')}</span>
            </div>
          </div>

          {dadosRelatorio.length > 0 && (
            <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                  {renderTableHeaders()}
                </thead>
                <tbody>
                  {renderTableBody()}
                </tbody>
                {renderTableFooter()}
              </table>
            </div>
          )}
          
        </div>
      </div>
    </main>
  );
}