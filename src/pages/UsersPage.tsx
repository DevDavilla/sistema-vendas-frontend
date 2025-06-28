import React, { useState, useEffect, useCallback } from "react"; // Adicionado React e corrigido import
import UserForm from "../components/UserForm";
import { BACKEND_BASE_URL, getAuthHeaders } from "../utils/authUtils";
import { toast } from "react-toastify"; // Importa toast
import Loader from "../components/Loader";

// Interfaces necessárias para esta página (declaradas localmente)
interface User {
  id: number;
  nome_usuario: string;
  permissao: string;
  ativo: boolean;
  criado_em: string;
}

// Outras interfaces que podem ser usadas aqui se necessário
interface Product {
  id?: number;
  nome?: string;
  preco_venda?: string;
  estoque?: number;
}
interface Client {
  id?: number;
  nome?: string;
  telefone?: string;
}
interface SaleItem {
  id?: number;
  produto_id?: number;
  quantidade?: number;
  preco_unitario_vendido?: string;
  subtotal?: string;
}
interface Sale {
  id?: number;
  cliente_id?: number | null;
  usuario_id?: number;
  data_hora?: string;
  total_venda?: string;
  forma_pagamento?: string;
  status?: string;
  itens?: SaleItem[];
}

function UsersPage({ token }: { token: string | null }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // Removido: const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    // Removido: setError(null);
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/usuarios`, {
        headers: getAuthHeaders(token),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! Status: ${response.status}`
        );
      }
      const data: User[] = await response.json();
      setUsers(data);
    } catch (err: any) {
      console.error("Erro ao carregar usuários:", err);
      toast.error(`Erro ao carregar usuários: ${err.message}`);
      // Removido: setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUserChange = () => {
    fetchUsers();
    setEditingUser(null);
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja deletar este usuário?")) {
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/usuarios/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! Status: ${response.status}`
        );
      }

      setUsers(users.filter((user) => user.id !== id));
      console.log(`Usuário com ID ${id} deletado com sucesso.`);
      toast.success(`Usuário deletado com sucesso!`);
      setEditingUser(null);
    } catch (err: any) {
      console.error("Erro ao deletar usuário:", err);
      toast.error(`Erro ao deletar usuário: ${err.message}`);
      // Removido: setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
  };

  if (loading) {
    return <Loader />;
  }

  // Removido: Bloco de erro da página (agora tratado por toasts)
  // if (error) { ... }

  return (
    <>
      <div className="form-card">
        <UserForm
          onUserAdded={handleUserChange}
          onUserUpdated={handleUserChange}
          userToEdit={editingUser}
          onCancelEdit={handleCancelEdit}
          token={token}
        />
      </div>

      <h2>Lista de Usuários</h2>
      {users.length === 0 ? (
        <p>
          Nenhum usuário cadastrado ainda. Adicione um usando o formulário
          above!
        </p>
      ) : (
        <ul>
          {users.map((user) => (
            <li key={user.id} className="list-item">
              <h3>{user.nome_usuario}</h3>
              <p>Permissão: {user.permissao}</p>
              <p>Ativo: {user.ativo ? "Sim" : "Não"}</p>
              <div className="actions">
                <button
                  onClick={() => handleEditUser(user)}
                  className="edit-button"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id)}
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

export default UsersPage;
