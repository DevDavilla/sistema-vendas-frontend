import { useState, useEffect } from "react";
import { BACKEND_BASE_URL, getAuthHeaders } from "../utils/authUtils"; // Importa do utils
import { toast } from "react-toastify"; // <-- NOVO: Importa toast

// Interfaces necessárias para este componente (declaradas localmente)
interface Product {
  id?: number;
  nome: string;
  descricao: string | null;
  preco_venda: string;
  estoque: number;
  codigo_barras: string | null;
  ativo?: boolean;
}

interface ProductFormProps {
  onProductAdded?: () => void;
  onProductUpdated?: () => void;
  productToEdit?: Product;
  onCancelEdit?: () => void;
  token: string | null;
}

function ProductForm({
  onProductAdded,
  onProductUpdated,
  productToEdit,
  onCancelEdit,
  token,
}: ProductFormProps) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [precoVenda, setPrecoVenda] = useState("");
  const [estoque, setEstoque] = useState("");
  const [codigoBarras, setCodigoBarras] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [loading, setLoading] = useState(false);
  // Removido: const [error, setError] = useState<string | null>(null);
  // Removido: const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (productToEdit) {
      setNome(productToEdit.nome);
      setDescricao(productToEdit.descricao || "");
      setPrecoVenda(productToEdit.preco_venda.toString());
      setEstoque(productToEdit.estoque.toString());
      setCodigoBarras(productToEdit.codigo_barras || "");
      setAtivo(productToEdit.ativo ?? true);
      // Removido: setError(null); setSuccessMessage(null);
    } else {
      setNome("");
      setDescricao("");
      setPrecoVenda("");
      setEstoque("");
      setCodigoBarras("");
      setAtivo(true);
      // Removido: setError(null); setSuccessMessage(null);
    }
  }, [productToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    // Removido: setError(null); setSuccessMessage(null);

    if (!nome || !precoVenda || !estoque) {
      toast.error("Por favor, preencha nome, preço de venda e estoque."); // <-- NOVO: Toast de erro
      setLoading(false);
      return;
    }

    const productData = {
      nome,
      descricao: descricao || null,
      preco_venda: parseFloat(precoVenda),
      estoque: parseInt(estoque),
      codigo_barras: codigoBarras || null,
      ativo: ativo,
    };

    try {
      const url = productToEdit
        ? `${BACKEND_BASE_URL}/api/produtos/${productToEdit.id}`
        : `${BACKEND_BASE_URL}/api/produtos`;
      const method = productToEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: getAuthHeaders(token),
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! Status: ${response.status}`
        );
      }

      const returnedProduct = await response.json();
      toast.success(
        `Produto "${returnedProduct.nome}" ${
          productToEdit ? "atualizado" : "adicionado"
        } com sucesso!`
      ); // <-- NOVO: Toast de sucesso

      // Removido: setTimeout para limpar mensagem de sucesso

      if (!productToEdit) {
        setNome("");
        setDescricao("");
        setPrecoVenda("");
        setEstoque("");
        setCodigoBarras("");
        setAtivo(true);
      } else {
        if (onCancelEdit) onCancelEdit();
      }

      if (onProductUpdated) {
        onProductUpdated();
      } else if (onProductAdded) {
        onProductAdded();
      }
    } catch (err: any) {
      console.error(
        `Erro ao ${productToEdit ? "atualizar" : "adicionar"} produto:`,
        err
      );
      toast.error(
        `Erro ao ${productToEdit ? "atualizar" : "adicionar"} produto: ${
          err.message
        }`
      ); // <-- NOVO: Toast de erro
      // Removido: setError(err.message); e setTimeout para limpar erro
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card">
      <h3>{productToEdit ? "Editar Produto" : "Adicionar Novo Produto"}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nome">Nome:</label>
          <input
            type="text"
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="descricao">Descrição:</label>
          <textarea
            id="descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="precoVenda">Preço de Venda:</label>
          <input
            type="number"
            id="precoVenda"
            value={precoVenda}
            onChange={(e) => setPrecoVenda(e.target.value)}
            step="0.01"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="estoque">Estoque:</label>
          <input
            type="number"
            id="estoque"
            value={estoque}
            onChange={(e) => setEstoque(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="codigoBarras">Código de Barras:</label>
          <input
            type="text"
            id="codigoBarras"
            value={codigoBarras}
            onChange={(e) => setCodigoBarras(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="ativo">Ativo:</label>
          <input
            type="checkbox"
            id="ativo"
            checked={ativo}
            onChange={(e) => setAtivo(e.target.checked)}
          />
        </div>
        <button type="submit">
          {loading
            ? productToEdit
              ? "Atualizando..."
              : "Adicionando..."
            : productToEdit
            ? "Atualizar Produto"
            : "Adicionar Produto"}
        </button>
        {productToEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="button-secondary"
          >
            Cancelar Edição
          </button>
        )}
      </form>
    </div>
  );
}

export default ProductForm;
