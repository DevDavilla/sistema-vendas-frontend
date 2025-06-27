import React, { useState, useEffect, useCallback } from "react";
import { BACKEND_BASE_URL, getAuthHeaders } from "../utils/authUtils";
import Loader from "../components/Loader"; // Imports de utilitários

// Interfaces necessárias para esta página (declaradas localmente)
interface SaleReportPeriod {
  periodo: string;
  total_vendido: string; // Vem como string do DECIMAL do DB
  total_vendas: string; // Vem como string do COUNT do DB
}

interface ProductReport {
  nome_produto: string;
  total_quantidade_vendida: string;
  total_valor_vendido: string;
}

interface UserSaleReport {
  nome_usuario: string;
  permissao: string;
  total_vendido: string;
  total_vendas: string;
}

interface ReportPageProps {
  token: string | null;
}

const ReportsPage: React.FC<ReportPageProps> = ({ token }) => {
  const [reportType, setReportType] = useState("sales-by-period"); // 'sales-by-period', 'best-selling-products', 'sales-by-user'
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para os dados de cada relatório
  const [salesByPeriodData, setSalesByPeriodData] = useState<
    SaleReportPeriod[]
  >([]);
  const [bestSellingProductsData, setBestSellingProductsData] = useState<
    ProductReport[]
  >([]);
  const [salesByUserData, setSalesByUserData] = useState<UserSaleReport[]>([]);

  // Filtros do relatório de vendas por período
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [groupBy, setGroupBy] = useState("day"); // 'day', 'month', 'year'

  // Pre-popula as datas para facilitar o teste inicial
  useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const formatDate = (date: Date) => date.toISOString().split("T")[0];

    setStartDate(formatDate(firstDayOfMonth));
    setEndDate(formatDate(today));
  }, []);

  // Funções para buscar cada tipo de relatório (mantidas como useCallback)
  const fetchSalesByPeriodReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!startDate || !endDate) {
        setError("Por favor, selecione as datas de início e fim.");
        return;
      }
      const url = `${BACKEND_BASE_URL}/api/relatorios/vendas\-por\-periodo?data\_inicio\=${startDate}&data_fim=${endDate}&agrupar_por=${groupBy}`;
      const response = await fetch(url, { headers: getAuthHeaders(token) });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! Status: ${response.status}`
        );
      }
      const data: SaleReportPeriod[] = await response.json();
      setSalesByPeriodData(data);
    } catch (err: any) {
      console.error("Erro ao carregar relatório de vendas por período:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, groupBy, token]);

  const fetchBestSellingProductsReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `${BACKEND_BASE_URL}/api/relatorios/produtos-mais-vendidos?limite=10`;
      const response = await fetch(url, { headers: getAuthHeaders(token) });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! Status: ${response.status}`
        );
      }
      const data: ProductReport[] = await response.json();
      setBestSellingProductsData(data);
    } catch (err: any) {
      console.error(
        "Erro ao carregar relatório de produtos mais vendidos:",
        err
      );
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchSalesByUserReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `${BACKEND_BASE_URL}/api/relatorios/vendas-por-usuario`;
      const response = await fetch(url, { headers: getAuthHeaders(token) });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! Status: ${response.status}`
        );
      }
      const data: UserSaleReport[] = await response.json();
      setSalesByUserData(data);
    } catch (err: any) {
      console.error("Erro ao carregar relatório de vendas por usuário:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // NOVO useEffect para acionar a busca com base no tipo de relatório selecionado
  useEffect(() => {
    if (token) {
      if (reportType === "sales-by-period") {
        fetchSalesByPeriodReport();
      } else if (reportType === "best-selling-products") {
        fetchBestSellingProductsReport();
      } else if (reportType === "sales-by-user") {
        fetchSalesByUserReport();
      }
    }
  }, [
    reportType,
    token,
    fetchSalesByPeriodReport,
    fetchBestSellingProductsReport,
    fetchSalesByUserReport,
  ]);

  const renderReportTable = () => {
    if (loading) {
      return <Loader />;
    }
    if (error) {
      return <p className="error-message">Erro: {error}.</p>;
    }

    if (reportType === "sales-by-period") {
      return (
        <>
          {salesByPeriodData.length === 0 ? (
            <p>
              Nenhum dado de vendas por período encontrado para o período
              selecionado.
            </p>
          ) : (
            <table className="report-table">
              <thead>
                <tr>
                  <th>Período</th>
                  <th>Total Vendido (R$)</th>
                  <th>Total de Vendas</th>
                </tr>
              </thead>
              <tbody>
                {salesByPeriodData.map((row) => (
                  <tr key={row.periodo}>
                    <td>{row.periodo}</td>
                    <td>{parseFloat(row.total_vendido).toFixed(2)}</td>
                    <td>{row.total_vendas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      );
    } else if (reportType === "best-selling-products") {
      return (
        <>
          {bestSellingProductsData.length === 0 ? (
            <p>
              Nenhum produto mais vendido encontrado para o período selecionado.
            </p>
          ) : (
            <table className="report-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Qtd Vendida</th>
                  <th>Valor Total (R$)</th>
                </tr>
              </thead>
              <tbody>
                {bestSellingProductsData.map((row) => (
                  <tr key={row.nome_produto}>
                    <td>{row.nome_produto}</td>
                    <td>{row.total_quantidade_vendida}</td>
                    <td>{parseFloat(row.total_valor_vendido).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      );
    } else if (reportType === "sales-by-user") {
      return (
        <>
          {salesByUserData.length === 0 ? (
            <p>
              Nenhum dado de vendas por usuário encontrado para o período
              selecionado.
            </p>
          ) : (
            <table className="report-table">
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>Permissão</th>
                  <th>Total Vendido (R$)</th>
                  <th>Total de Vendas</th>
                </tr>
              </thead>
              <tbody>
                {salesByUserData.map((row) => (
                  <tr key={row.nome_usuario}>
                    <td>{row.nome_usuario}</td>
                    <td>{row.permissao}</td>
                    <td>{parseFloat(row.total_vendido).toFixed(2)}</td>
                    <td>{row.total_vendas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      );
    }
    return null;
  };

  return (
    <div className="report-page-container form-card">
      {" "}
      {/* Reutiliza classe form-card para estilo */}
      <h2>Relatórios de Vendas</h2>
      {error && <p className="error-message">{error}</p>}
      <div className="report-controls form-group">
        <label htmlFor="reportType">Tipo de Relatório:</label>
        <select
          id="reportType"
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
        >
          <option value="sales-by-period">Vendas por Período</option>
          <option value="best-selling-products">Produtos Mais Vendidos</option>
          <option value="sales-by-user">Vendas por Usuário</option>
        </select>

        {/* Filtros para Vendas por Período */}
        {reportType === "sales-by-period" && (
          <span className="date-filters">
            {" "}
            {/* Span para agrupar e aplicar estilo */}
            <label htmlFor="startDate" style={{ marginLeft: "15px" }}>
              Data Início:
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <label htmlFor="endDate" style={{ marginLeft: "15px" }}>
              Data Fim:
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
            <label htmlFor="groupBy" style={{ marginLeft: "15px" }}>
              Agrupar por:
            </label>
            <select
              id="groupBy"
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
            >
              <option value="day">Dia</option>
              <option value="month">Mês</option>
              <option value="year">Ano</option>
            </select>
          </span>
        )}

        {/* Botão para Gerar Relatório - Chama a função específica do relatório selecionado */}
        <button
          onClick={() => {
            // Chama a função correta baseada no tipo
            if (reportType === "sales-by-period") fetchSalesByPeriodReport();
            else if (reportType === "best-selling-products")
              fetchBestSellingProductsReport();
            else if (reportType === "sales-by-user") fetchSalesByUserReport();
          }}
          className="submit-button"
          style={{ marginLeft: "20px" }}
          disabled={
            loading ||
            (reportType === "sales-by-period" && (!startDate || !endDate))
          }
        >
          {loading ? "Gerando..." : "Gerar Relatório"}
        </button>
      </div>
      <div className="report-display">{renderReportTable()}</div>
    </div>
  );
};

export default ReportsPage;
