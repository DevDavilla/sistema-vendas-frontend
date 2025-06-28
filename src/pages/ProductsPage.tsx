import { useState, useEffect, useCallback } from "react";
import ProductForm from "../components/ProductForm";
import { BACKEND_BASE_URL, getAuthHeaders } from "../utils/authUtils";
import { toast } from "react-toastify";
import Loader from "../components/Loader";

// Interfaces necessárias para esta página (declaradas localmente)
interface Product {
  id: number;
  nome: string;
  descricao: string | null;
  preco_venda: string; // <--- AGORA É STRING AQUI, COMO VEM DO DB
  estoque: number;
  codigo_barras: string | null;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

function ProductsPage({ token }: { token: string | null }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // Removido: const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(
    undefined
  );

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/produtos`, {
        headers: getAuthHeaders(token),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! Status: ${response.status}`
        );
      }
      const data: Product[] = await response.json();
      setProducts(data);
    } catch (err: any) {
      console.error("Erro ao carregar produtos:", err);
      toast.error(`Erro ao carregar produtos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleProductChange = () => {
    fetchProducts();
    setEditingProduct(undefined);
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja deletar este produto?")) {
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/produtos/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! Status: ${response.status}`
        );
      }

      setProducts(products.filter((product) => product.id !== id));
      console.log(`Produto com ID ${id} deletado com sucesso.`);
      toast.success(`Produto deletado com sucesso!`);
      setEditingProduct(undefined);
    } catch (err: any) {
      console.error("Erro ao deletar produto:", err);
      toast.error(`Erro ao deletar produto: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  const handleCancelEdit = () => {
    setEditingProduct(undefined);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <div className="form-card">
        <ProductForm
          onProductAdded={handleProductChange}
          onProductUpdated={handleProductChange}
          productToEdit={editingProduct}
          onCancelEdit={handleCancelEdit}
          token={token}
        />
      </div>

      <h2>Lista de Produtos</h2>
      {products.length === 0 ? (
        <p>
          Nenhum produto cadastrado ainda. Adicione um usando o formulário
          acima!
        </p>
      ) : (
        <ul>
          {products.map((product) => (
            <li key={product.id} className="list-item">
              <h3>{product.nome}</h3>
              <p>Descrição: {product.descricao || "N/A"}</p>
              <p>Preço: R$ {parseFloat(product.preco_venda).toFixed(2)}</p>
              <p>Estoque: {product.estoque}</p>
              <p>Código de Barras: {product.codigo_barras || "N/A"}</p>
              <p>Ativo: {product.ativo ? "Sim" : "Não"}</p>
              <div className="actions">
                <button
                  onClick={() => handleEditProduct(product)}
                  className="edit-button"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  className="delete-button"
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default ProductsPage;
