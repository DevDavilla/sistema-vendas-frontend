import { useState } from "react";
import "./LoginPage.css";
import { BACKEND_BASE_URL } from "../config/api";
import { toast } from "react-toastify";

// Interfaces necessárias para este componente (declaradas localmente)
interface LoginUser {
  id: number;
  nome_usuario: string;
  permissao: string;
}

interface LoginPageProps {
  onLoginSuccess: (
    token: string,
    userId: number,
    userPermission: string
  ) => void;
}

function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  // Removido: const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Removido: setError(null);

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nome_usuario: username, senha: password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! Status: ${response.status}`
        );
      }

      const data = await response.json();
      onLoginSuccess(data.token, data.user.id, data.user.permissao);
      // Removido: Mensagem de sucesso aqui (já tratada em App.tsx)
    } catch (err: any) {
      console.error("Erro no login:", err);
      toast.error(`Falha no login: ${err.message}`); // <-- NOVO: Toast de erro
      // Removido: setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login no Sistema de Vendas</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Nome de Usuário:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Senha:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading} className="login-button">
          {loading ? "Entrando..." : "Entrar"}
        </button>
        {/* Removido: {error && <p className="error-message">{error}</p>} */}
      </form>
    </div>
  );
}

export default LoginPage;
