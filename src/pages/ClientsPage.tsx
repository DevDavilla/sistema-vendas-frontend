import { useState, useEffect, useCallback } from "react";
import ClientForm from "../components/ClientForm";
import { BACKEND_BASE_URL, getAuthHeaders } from "../utils/authUtils";
import { toast } from "react-toastify";
import Loader from "../components/Loader";

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
  // Removido: const [error, setError] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    // Removido: setError(null);
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
      toast.error(`Erro ao carregar clientes: ${err.message}`); // <-- NOVO: Toast de erro
      // Removido: setError(err.message);
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
    setLoading(true); // Ativa loading
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
      toast.success(`Cliente deletado com sucesso!`); // <-- NOVO: Toast de sucesso
      setEditingClient(null);
    } catch (err: any) {
      console.error("Erro ao deletar cliente:", err);
      toast.error(`Erro ao deletar cliente: ${err.message}`); // <-- NOVO: Toast de erro
      // Removido: setError(err.message);
    } finally {
      setLoading(false); // Desativa loading
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

  // Removido: Bloco de erro da página (agora tratado por toasts)
  // if (error) { ... }

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
