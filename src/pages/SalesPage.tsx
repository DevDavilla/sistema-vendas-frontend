import { useState, useEffect, useCallback } from "react";
import { BACKEND_BASE_URL, getAuthHeaders } from "../utils/authUtils";
import { toast } from "react-toastify";
import Loader from "../components/Loader";

// Interfaces necessárias para esta página (declaradas localmente)
interface Product {
  id: number;
  nome: string;
  descricao: string | null;
  preco_venda: string;
  estoque: number;
  codigo_barras: string | null;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}
interface Client {
  id: number;
  nome: string;
  cpf_cnpj: string | null;
  email: string | null;
  telefone: string;
  endereco: string | null;
  criado_em: string;
}
interface User {
  id: number;
  nome_usuario: string;
  permissao: string;
  ativo: boolean;
  criado_em: string;
}
interface SaleItem {
  id: number;
  venda_id: number;
  produto_id: number;
  quantidade: number;
  preco_unitario_vendido: string;
  subtotal: string;
  nome_produto?: string;
  preco_atual_produto?: string;
}
interface Sale {
  id: number;
  cliente_id: number | null;
  usuario_id: number;
  data_hora: string;
  total_venda: string;
  forma_pagamento: string;
  status: string;
  itens?: SaleItem[];
}

function SalesPage({ token }: { token: string | null }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [saleItems, setSaleItems] = useState<
    { product: Product; quantity: number; subtotal: number }[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState<boolean>(false); // General loading
  const [salesHistory, setSalesHistory] = useState<Sale[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(true); // Loading for history fetch
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const fetchSalesHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/vendas`, {
        headers: getAuthHeaders(token),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! Status: ${response.status}`
        );
      }
      const data: Sale[] = await response.json();
      setSalesHistory(data);
    } catch (err: any) {
      console.error("Erro ao carregar histórico de vendas:", err);
      toast.error(`Erro ao carregar histórico de vendas: ${err.message}`);
    } finally {
      setLoadingHistory(false);
    }
  }, [token]);

  const fetchSaleDetails = async (id: number) => {
    setLoadingHistory(true); // Reusa o loading para detalhes também
    try {
      const response = await fetch(
        `<span class="math-inline">\{BACKEND\_BASE\_URL\}/api/vendas/</span>{id}`,
        {
          headers: getAuthHeaders(token),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! Status: ${response.status}`
        );
      }
      const data: Sale = await response.json();
      setSelectedSale(data);
    } catch (err: any) {
      console.error(`Erro ao carregar detalhes da venda ${id}:`, err);
      toast.error(`Erro ao carregar detalhes da venda: ${err.message}`);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // General loading for initial data
      try {
        const [clientsRes, productsRes, usersRes] = await Promise.all([
          fetch(`${BACKEND_BASE_URL}/api/clientes`, {
            headers: getAuthHeaders(token),
          }),
          fetch(`${BACKEND_BASE_URL}/api/produtos`, {
            headers: getAuthHeaders(token),
          }),
          fetch(`${BACKEND_BASE_URL}/api/usuarios`, {
            headers: getAuthHeaders(token),
          }),
        ]);

        if (!clientsRes.ok || !productsRes.ok || !usersRes.ok) {
          throw new Error("Falha ao carregar dados essenciais para a venda.");
        }

        const clientsData: Client[] = await clientsRes.json();
        const productsData: Product[] = await productsRes.json();
        const usersData: User[] = await usersRes.json();

        setClients(clientsData);
        setProducts(productsData);
        setUsers(usersData);
        if (usersData.length > 0) {
          setSelectedUserId(usersData[0].id);
        }

        await fetchSalesHistory(); // Carrega o histórico de vendas inicialmente
      } catch (err: any) {
        console.error("Erro ao carregar dados para a página de vendas:", err);
        toast.error(
          `Erro ao carregar dados para a página de vendas: ${err.message}`
        );
      } finally {
        setLoading(false); // End general loading
      }
    };
    fetchData();
  }, [token, fetchSalesHistory]);

  useEffect(() => {
    if (searchTerm) {
      setFilteredProducts(
        products.filter(
          (product) =>
            product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.codigo_barras &&
              product.codigo_barras.includes(searchTerm))
        )
      );
    } else {
      setFilteredProducts([]);
    }
  }, [searchTerm, products]);

  const handleAddProductToSale = (product: Product) => {
    const existingItem = saleItems.find(
      (item) => item.product.id === product.id
    );

    if (existingItem) {
      setSaleItems(
        saleItems.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * parseFloat(product.preco_venda),
              }
            : item
        )
      );
    } else {
      setSaleItems([
        ...saleItems,
        { product, quantity: 1, subtotal: parseFloat(product.preco_venda) },
      ]);
    }
    setSearchTerm("");
    setFilteredProducts([]);
  };

  const handleRemoveItem = (productId: number) => {
    setSaleItems(saleItems.filter((item) => item.product.id !== productId));
  };

  const handleUpdateItemQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setSaleItems(
      saleItems.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity: newQuantity,
              subtotal: newQuantity * parseFloat(item.product.preco_venda),
            }
          : item
      )
    );
  };

  const totalSale = saleItems.reduce((sum, item) => sum + item.subtotal, 0);

  const handleFinalizeSale = async () => {
    setLoading(true); // Ativa loading para a operação de finalização
    if (!selectedUserId) {
      toast.error("Por favor, selecione o usuário responsável pela venda.");
      setLoading(false);
      return;
    }
    if (!paymentMethod) {
      toast.error("Por favor, selecione a forma de pagamento.");
      setLoading(false);
      return;
    }
    if (saleItems.length === 0) {
      toast.error("Adicione pelo menos um item à venda.");
      setLoading(false);
      return;
    }

    const saleData = {
      cliente_id: selectedClientId,
      usuario_id: selectedUserId,
      forma_pagamento: paymentMethod,
      itens: saleItems.map((item) => ({
        produto_id: item.product.id,
        quantidade: item.quantity,
      })),
    };

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/vendas`, {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify(saleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! Status: ${response.status}`
        );
      }

      const result = await response.json();
      toast.success(
        `Venda #${
          result.venda.id
        } registrada com sucesso! Total: R$ ${parseFloat(
          result.venda.total_venda
        ).toFixed(2)}`
      );

      setSelectedClientId(null);
      setPaymentMethod("");
      setSaleItems([]);
      setSearchTerm("");
      setFilteredProducts([]);

      await fetchSalesHistory(); // Recarrega o histórico de vendas após nova venda
    } catch (err: any) {
      console.error("Erro ao finalizar venda:", err);
      toast.error(`Erro ao finalizar venda: ${err.message}`);
    } finally {
      setLoading(false); // Desativa loading após a operação
    }
  };

  const handleCancelSale = async (saleId: number, currentStatus: string) => {
    if (currentStatus === "Cancelada") {
      toast.warn("Esta venda já está cancelada.");
      return;
    }
    setLoading(true); // Ativa loading para a operação de cancelamento

    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/vendas/${saleId}/cancelar`,
        {
          method: "PUT",
          headers: getAuthHeaders(token),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! Status: ${response.status}`
        );
      }

      const result = await response.json();
      toast.success(
        `Venda #${saleId} ${
          result.message.includes("desativada") ? "desativada" : "cancelada"
        } com sucesso!`
      );

      await fetchSalesHistory();
    } catch (err: any) {
      console.error(`Erro ao cancelar venda ${saleId}:`, err);
      toast.error(`Erro ao cancelar venda: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading || loadingHistory) {
    return <Loader />;
  }

  if (selectedSale) {
    return (
      <div className="sale-details-card">
        <button onClick={() => setSelectedSale(null)} className="back-button">
          &lt; Voltar para o Histórico de Vendas
        </button>
        <h2>Detalhes da Venda #{selectedSale.id}</h2>
        <p>
          <strong>Cliente:</strong>{" "}
          {clients.find((c) => c.id === selectedSale.cliente_id)?.nome ||
            "Não Informado"}
        </p>
        <p>
          <strong>Usuário:</strong>{" "}
          {users.find((u) => u.id === selectedSale.usuario_id)?.nome_usuario ||
            "Desconhecido"}
        </p>
        <p>
          <strong>Data/Hora:</strong>{" "}
          {new Date(selectedSale.data_hora).toLocaleString()}
        </p>
        <p>
          <strong>Forma de Pagamento:</strong> {selectedSale.forma_pagamento}
        </p>
        <p>
          <strong>Status:</strong>{" "}
          <span
            className={
              selectedSale.status === "Cancelada"
                ? "sale-status-cancelled"
                : "sale-status-completed"
            }
          >
            {selectedSale.status}
          </span>
        </p>
        <p>
          <strong>Total da Venda:</strong> R${" "}
          {parseFloat(selectedSale.total_venda).toFixed(2)}
        </p>

        <h3 className="section-title">Itens da Venda:</h3>
        {selectedSale.itens && selectedSale.itens.length > 0 ? (
          <ul className="items-list">
            {selectedSale.itens.map((item) => (
              <li key={item.id}>
                {item.nome_produto} - Qtd: {item.quantidade} x R${" "}
                {parseFloat(item.preco_unitario_vendido).toFixed(2)} = R${" "}
                {parseFloat(item.subtotal).toFixed(2)}
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhum item encontrado para esta venda.</p>
        )}
      </div>
    );
  }

  return (
    <div className="sale-page-container">
      <h2>Registrar Nova Venda</h2>

      {/* Seleção de Cliente */}
      <div className="form-group">
        <label htmlFor="clientSelect">Cliente (Opcional):</label>
        <select
          id="clientSelect"
          value={selectedClientId || ""}
          onChange={(e) =>
            setSelectedClientId(
              e.target.value ? parseInt(e.target.value) : null
            )
          }
        >
          <option value="">-- Selecione um Cliente --</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.nome} ({client.telefone})
            </option>
          ))}
        </select>
      </div>

      {/* Seleção de Usuário Responsável */}
      <div className="form-group">
        <label htmlFor="userSelect">Usuário (Obrigatório):</label>
        <select
          id="userSelect"
          value={selectedUserId || ""}
          onChange={(e) => setSelectedUserId(parseInt(e.target.value))}
          required
        >
          <option value="">-- Selecione um Usuário --</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.nome_usuario} ({user.permissao})
            </option>
          ))}
        </select>
      </div>

      {/* Busca e Adição de Produtos */}
      <div className="form-group">
        <label htmlFor="productSearch">Adicionar Produto:</label>
        <input
          type="text"
          id="productSearch"
          placeholder="Buscar produto por nome ou código..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {filteredProducts.length > 0 && (
          <ul className="filtered-products-list">
            {filteredProducts.map((product) => (
              <li
                key={product.id}
                onClick={() => handleAddProductToSale(product)}
              >
                {product.nome} - R$ {parseFloat(product.preco_venda).toFixed(2)}{" "}
                (Estoque: {product.estoque})
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Lista de Itens da Venda (Carrinho) */}
      <h3 className="section-title">Itens da Venda:</h3>
      {saleItems.length === 0 ? (
        <p>Nenhum item adicionado à venda ainda.</p>
      ) : (
        <ul className="sales-item-list">
          {saleItems.map((item) => (
            <li key={item.product.id}>
              {console.log("Item sendo renderizado:", item)}
              <div>
                <h4>{item.product.nome}</h4>
                <p>
                  Preço Unit.: R$
                  {
                    // Usa item.product.preco_venda, que está no JSON, e garante que é string antes de parseFloat
                    parseFloat(item.product.preco_venda || "0").toFixed(2) // <-- CORRIGIDO AQUI!
                  }
                </p>
                <p>Subtotal: R$ {item.subtotal.toFixed(2)}</p>
              </div>
              <div className="item-qty-control">
                <label htmlFor={`qty-${item.product.id}`}>Qtd:</label>
                <input
                  type="number"
                  id={`qty-${item.product.id}`}
                  value={item.quantity}
                  min="1"
                  onChange={(e) =>
                    handleUpdateItemQuantity(
                      item.product.id,
                      parseInt(e.target.value)
                    )
                  }
                  className="quantity-input"
                />
                <button
                  onClick={() => handleRemoveItem(item.product.id)}
                  className="remove-item-button"
                >
                  Remover
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h3 className="total-sale-display">
        Total da Venda: R$ {totalSale.toFixed(2)}
      </h3>

      {/* Forma de Pagamento */}
      <div className="form-group">
        <label htmlFor="paymentMethod">Forma de Pagamento (Obrigatório):</label>
        <select
          id="paymentMethod"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          required
        >
          <option value="">-- Selecione a Forma de Pagamento --</option>
          <option value="Dinheiro">Dinheiro</option>
          <option value="Cartão de Crédito">Cartão de Crédito</option>
          <option value="Cartão de Débito">Cartão de Débito</option>
          <option value="Pix">Pix</option>
          <option value="Boleto">Boleto</option>
        </select>
      </div>

      {/* Botão Finalizar Venda */}
      <button
        onClick={handleFinalizeSale}
        disabled={
          loading || saleItems.length === 0 || !selectedUserId || !paymentMethod
        }
        className="submit-button"
      >
        {loading ? "Finalizando..." : "Finalizar Venda"}
      </button>

      <h3 className="section-title sales-history-title">Histórico de Vendas</h3>
      {salesHistory.length === 0 ? (
        <p>Nenhuma venda registrada ainda.</p>
      ) : (
        <ul className="sales-history-list">
          {salesHistory.map((sale) => (
            <li key={sale.id} className="list-item">
              <h4>Venda #{sale.id}</h4>
              <p>Data: {new Date(sale.data_hora).toLocaleString()}</p>
              <p>Total: R$ {parseFloat(sale.total_venda).toFixed(2)}</p>
              <p>Forma Pagamento: {sale.forma_pagamento}</p>
              <p>
                Usuário:{" "}
                {users.find((u) => u.id === sale.usuario_id)?.nome_usuario ||
                  "Desconhecido"}
              </p>
              <p>
                Cliente:{" "}
                {clients.find((c) => c.id === sale.cliente_id)?.nome ||
                  "Não Informado"}
              </p>
              <button
                onClick={() => handleCancelSale(sale.id, sale.status)}
                className="delete-button"
                style={{ marginLeft: "10px" }}
                disabled={sale.status === "Cancelada"}
              >
                {sale.status === "Cancelada" ? "Cancelada" : "Cancelar Venda"}
              </button>
              <button
                onClick={() => fetchSaleDetails(sale.id)}
                className="details-button"
              >
                Ver Detalhes
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
export default SalesPage;
