import { useState, useEffect } from "react";
import { BACKEND_BASE_URL, getAuthHeaders } from "../utils/authUtils"; // Importa do utils
import { toast } from "react-toastify"; // <-- NOVO: Importa toast

// Interfaces necessárias para este componente (declaradas localmente)
interface Client {
  id?: number;
  nome: string;
  cpf_cnpj: string | null;
  email: string | null;
  telefone: string;
  endereco: string | null;
  criado_em?: string;
}

interface ClientFormProps {
  onClientAdded?: () => void;
  onClientUpdated?: () => void;
  clientToEdit?: Client | null;
  onCancelEdit?: () => void;
  token: string | null;
}

function ClientForm({
  onClientAdded,
  onClientUpdated,
  clientToEdit,
  onCancelEdit,
  token,
}: ClientFormProps) {
  const [nome, setNome] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [loading, setLoading] = useState(false);
  // Removido: const [error, setError] = useState<string | null>(null);
  // Removido: const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (clientToEdit) {
      setNome(clientToEdit.nome);
      setCpfCnpj(clientToEdit.cpf_cnpj || "");
      setEmail(clientToEdit.email || "");
      setTelefone(clientToEdit.telefone);
      setEndereco(clientToEdit.endereco || "");
      // Removido: setError(null); setSuccessMessage(null);
    } else {
      setNome("");
      setCpfCnpj("");
      setEmail("");
      setTelefone("");
      setEndereco("");
      // Removido: setError(null); setSuccessMessage(null);
    }
  }, [clientToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    // Removido: setError(null); setSuccessMessage(null);

    if (!nome || !telefone) {
      toast.error("Nome e telefone são campos obrigatórios."); // <-- NOVO: Toast de erro
      setLoading(false);
      return;
    }

    const clientData = {
      nome,
      cpf_cnpj: cpfCnpj || null,
      email: email || null,
      telefone,
      endereco: endereco || null,
    };

    try {
      const url = clientToEdit
        ? `${BACKEND_BASE_URL}/api/clientes/${clientToEdit.id}`
        : `${BACKEND_BASE_URL}/api/clientes`;
      const method = clientToEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: getAuthHeaders(token),
        body: JSON.stringify(clientData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! Status: ${response.status}`
        );
      }

      const returnedClient = await response.json();
      toast.success(
        `Cliente "${returnedClient.nome}" ${
          clientToEdit ? "atualizado" : "adicionado"
        } com sucesso!`
      ); // <-- NOVO: Toast de sucesso

      // Removido: setTimeout para limpar mensagem de sucesso

      if (!clientToEdit) {
        setNome("");
        setCpfCnpj("");
        setEmail("");
        setTelefone("");
        setEndereco("");
      } else {
        if (onCancelEdit) onCancelEdit();
      }

      if (onClientUpdated) {
        onClientUpdated();
      } else if (onClientAdded) {
        onClientAdded();
      }
    } catch (err: any) {
      console.error(
        `Erro ao ${clientToEdit ? "atualizar" : "adicionar"} cliente:`,
        err
      );
      toast.error(
        `Erro ao ${clientToEdit ? "atualizar" : "adicionar"} cliente: ${
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
      <h3>{clientToEdit ? "Editar Cliente" : "Adicionar Novo Cliente"}</h3>
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
          <label htmlFor="cpfCnpj">CPF/CNPJ:</label>
          <input
            type="text"
            id="cpfCnpj"
            value={cpfCnpj}
            onChange={(e) => setCpfCnpj(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="telefone">Telefone:</label>
          <input
            type="text"
            id="telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="endereco">Endereço:</label>
          <textarea
            id="endereco"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
          />
        </div>
        <button type="submit">
          {loading
            ? clientToEdit
              ? "Atualizando..."
              : "Adicionando..."
            : clientToEdit
            ? "Atualizar Cliente"
            : "Adicionar Cliente"}
        </button>
        {clientToEdit && (
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

export default ClientForm;
