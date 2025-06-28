import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import ClientForm from "../components/ClientForm";
import Loader from "../components/Loader";
import { BACKEND_BASE_URL, getAuthHeaders } from "../utils/authUtils";

// Interfaces necessárias para esta página (declaradas localmente)
interface Client {
  id: number;
  nome: string;
  cpf_cnpj: string | null;
  email: string | null;
  telefone: string;
  endereco: string | null;
  criado_em: string;
}

function ClientsPage({ token }: { token: string | null }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/clientes`, {
        headers: getAuthHeaders(token),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! Status: ${response.status}`
        );
      }
      const data: Client[] = await response.json();
      setClients(data);
    } catch (err: any) {
      console.error("Erro ao carregar clientes:", err);
      setError(err.message);
      toast.error(`Erro ao carregar clientes: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleClientChange = () => {
    fetchClients();
    setEditingClient(null);
  };

  const handleDeleteClient = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja deletar este cliente?")) {
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/clientes/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! Status: ${response.status}`
        );
      }

      setClients(clients.filter((client) => client.id !== id));
      console.log(`Cliente com ID ${id} deletado com sucesso.`);
      toast.success(`Cliente deletado com sucesso!`);
      setEditingClient(null);
    } catch (err: any) {
      console.error("Erro ao deletar cliente:", err);
      setError(err.message);
      toast.error(`Erro ao deletar cliente: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
  };

  const handleCancelEdit = () => {
    setEditingClient(null);
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <p className="error-message">
        Erro: {error}. Certifique-se de que o backend está rodando em{" "}
        <a
          href={`${BACKEND_BASE_URL}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {BACKEND_BASE_URL}
        </a>
        .
      </p>
    );
  }

  return (
    <>
      <div className="form-card">
        <ClientForm
          onClientAdded={handleClientChange}
          onClientUpdated={handleClientChange}
          clientToEdit={editingClient}
          onCancelEdit={handleCancelEdit}
          token={token}
        />
      </div>

      <h2>Lista de Clientes</h2>
      {clients.length === 0 ? (
        <p>
          Nenhum cliente cadastrado ainda. Adicione um usando o formulário
          acima!
        </p>
      ) : (
        <ul>
          {clients.map((client) => (
            <li key={client.id} className="list-item">
              <h3>{client.nome}</h3>
              <p>CPF/CNPJ: {client.cpf_cnpj || "N/A"}</p>
              <p>Email: {client.email || "N/A"}</p>
              <p>Telefone: {client.telefone}</p>
              <p>Endereço: {client.endereco || "N/A"}</p>
              <div className="actions">
                <button
                  onClick={() => handleEditClient(client)}
                  className="edit-button"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteClient(client.id)}
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

export default ClientsPage;
