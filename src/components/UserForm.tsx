import { useState, useEffect } from "react";
import { BACKEND_BASE_URL, getAuthHeaders } from "../utils/authUtils"; // Importa do utils

// Interfaces necessárias para este componente (declaradas localmente)
interface User {
  id?: number;
  nome_usuario: string;
  permissao: string;
  ativo?: boolean;
  criado_em?: string;
}

interface UserFormProps {
  onUserAdded?: () => void;
  onUserUpdated?: () => void;
  userToEdit?: User | null;
  onCancelEdit?: () => void;
  token: string | null;
}

function UserForm({
  onUserAdded,
  onUserUpdated,
  userToEdit,
  onCancelEdit,
  token,
}: UserFormProps) {
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [permissao, setPermissao] = useState("vendedor");
  const [ativo, setAtivo] = useState(true);
  const [loading, setLoading] = useState(false);
  // Removido: const [error, setError] = useState<string | null>(null);
  // Removido: const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (userToEdit) {
      setNomeUsuario(userToEdit.nome_usuario);
      setSenha("");
      setPermissao(userToEdit.permissao);
      setAtivo(userToEdit.ativo ?? true);
      // Removido: setError(null); setSuccessMessage(null);
    } else {
      setNomeUsuario("");
      setSenha("");
      setPermissao("vendedor");
      setAtivo(true);
      // Removido: setError(null); setSuccessMessage(null);
    }
  }, [userToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    // Removido: setError(null); setSuccessMessage(null);

    if (!nomeUsuario || (!userToEdit && !senha)) {
      toast.error(
        "Nome de usuário e senha (para novos usuários) são obrigatórios."
      ); // <-- NOVO: Toast de erro
      setLoading(false);
      return;
    }

    const userData: {
      nome_usuario: string;
      senha?: string;
      permissao: string;
      ativo?: boolean;
    } = {
      nome_usuario: nomeUsuario,
      permissao: permissao,
    };

    if (senha) {
      userData.senha = senha;
    }
    if (userToEdit) {
      userData.ativo = ativo;
    }

    try {
      const url = userToEdit
        ? `${BACKEND_BASE_URL}/api/usuarios/${userToEdit.id}`
        : `${BACKEND_BASE_URL}/api/usuarios`;
      const method = userToEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: getAuthHeaders(token),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! Status: ${response.status}`
        );
      }

      const returnedUser = await response.json();
      toast.success(
        `Usuário "${returnedUser.nome_usuario}" ${
          userToEdit ? "atualizado" : "adicionado"
        } com sucesso!`
      ); // <-- NOVO: Toast de sucesso

      // Removido: setTimeout para limpar mensagem de sucesso

      if (!userToEdit) {
        setNomeUsuario("");
        setSenha("");
        setPermissao("vendedor");
        setAtivo(true);
      } else {
        if (onCancelEdit) onCancelEdit();
      }

      if (onUserUpdated) {
        onUserUpdated();
      } else if (onUserAdded) {
        onUserAdded();
      }
    } catch (err: any) {
      console.error(
        `Erro ao ${userToEdit ? "atualizar" : "adicionar"} usuário:`,
        err
      );
      toast.error(
        `Erro ao ${userToEdit ? "atualizar" : "adicionar"} usuário: ${
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
      <h3>{userToEdit ? "Editar Usuário" : "Adicionar Novo Usuário"}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nomeUsuario">Nome de Usuário:</label>
          <input
            type="text"
            id="nomeUsuario"
            value={nomeUsuario}
            onChange={(e) => setNomeUsuario(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="senha">Senha:</label>
          <input
            type="password"
            id="senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required={!userToEdit}
          />
        </div>
        <div className="form-group">
          <label htmlFor="permissao">Permissão:</label>
          <select
            id="permissao"
            value={permissao}
            onChange={(e) => setPermissao(e.target.value)}
          >
            <option value="vendedor">Vendedor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {userToEdit && (
          <div className="form-group">
            <label htmlFor="ativo">Ativo:</label>
            <input
              type="checkbox"
              id="ativo"
              checked={ativo}
              onChange={(e) => setAtivo(e.target.checked)}
            />
          </div>
        )}
        <button type="submit">
          {loading
            ? userToEdit
              ? "Atualizando..."
              : "Adicionando..."
            : userToEdit
            ? "Atualizar Usuário"
            : "Adicionar Usuário"}
        </button>
        {userToEdit && (
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

export default UserForm;
