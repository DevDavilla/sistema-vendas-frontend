import React, { useState, useEffect, useCallback } from "react";
import "./App.css"; // Seu CSS principal
import { ToastContainer, toast } from "react-toastify"; // <-- NOVO: Importa ToastContainer e toast
import "react-toastify/dist/ReactToastify.css"; // <-- NOVO: Importa os estilos CSS do toast

// Importa os componentes de formulário (usados pelas páginas)
import LoginPage from "./components/LoginPage";

// Importa as páginas refatoradas (ELAS ESTÃO NA PASTA src/pages/)
import ProductsPage from "./pages/ProductsPage";
import ClientsPage from "./pages/ClientsPage";
import UsersPage from "./pages/UsersPage";
import SalesPage from "./pages/SalesPage";
import ReportsPage from "./pages/ReportsPage";

// Importa a URL base e a função de headers de autenticação (usados por App e pages)
import { BACKEND_BASE_URL, getAuthHeaders } from "./utils/authUtils";

// --- Componente principal App ---
function App() {
  // Estados para gerenciar a autenticação
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [userPermission, setUserPermission] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState("products"); // Estado para controlar a página atual

  // Efeito para carregar token do localStorage ao iniciar
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");
    const storedUserPermission = localStorage.getItem("userPermission");

    if (storedToken && storedUserId && storedUserPermission) {
      setToken(storedToken);
      setUserId(parseInt(storedUserId));
      setUserPermission(storedUserPermission);
    }
  }, []);

  // Função para lidar com o sucesso do login
  const handleLoginSuccess = (
    newToken: string,
    newUserId: number,
    newUserPermission: string
  ) => {
    setToken(newToken);
    setUserId(newUserId);
    setUserPermission(newUserPermission);
    localStorage.setItem("token", newToken);
    localStorage.setItem("userId", newUserId.toString());
    localStorage.setItem("userPermission", newUserPermission);
    setCurrentPage("products"); // Redireciona para a página de produtos após login
    toast.success("Login bem-sucedido!"); // <-- NOVO: Toast de sucesso no login
  };

  // Função para lidar com o logout
  const handleLogout = () => {
    setToken(null);
    setUserId(null);
    setUserPermission(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userPermission");
    setCurrentPage("products"); // Volta para login ou página inicial
    toast.info("Você foi desconectado."); // <-- NOVO: Toast de informação no logout
  };

  // Renderiza a página atual com base no estado 'currentPage'
  const renderPage = () => {
    if (!token) {
      // A LoginPage terá seus próprios toasts de erro/sucesso de login
      return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }

    switch (currentPage) {
      case "products":
        return <ProductsPage token={token} />;
      case "clients":
        return <ClientsPage token={token} />;
      case "users":
        return <UsersPage token={token} />;
      case "sales":
        return <SalesPage token={token} />;
      case "reports":
        return <ReportsPage token={token} />;
      default:
        return <ProductsPage token={token} />;
    }
  };

  return (
    <div className="App">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />{" "}
      {/* <-- NOVO: Container para os Toasts */}
      <header>
        <h1>Sistema de Gerenciamento de Vendas</h1>
        {token && (
          <nav className="main-nav">
            <button
              onClick={() => setCurrentPage("products")}
              className={currentPage === "products" ? "active-page" : ""}
            >
              Produtos
            </button>
            <button
              onClick={() => setCurrentPage("clients")}
              className={currentPage === "clients" ? "active-page" : ""}
            >
              Clientes
            </button>
            <button
              onClick={() => setCurrentPage("users")}
              className={currentPage === "users" ? "active-page" : ""}
            >
              Usuários
            </button>
            <button
              onClick={() => setCurrentPage("sales")}
              className={currentPage === "sales" ? "active-page" : ""}
            >
              Vendas
            </button>
            <button
              onClick={() => setCurrentPage("reports")}
              className={currentPage === "reports" ? "active-page" : ""}
            >
              Relatórios
            </button>
            <button onClick={handleLogout} className="logout-button">
              Sair
            </button>
            <span className="logged-in-info">
              Logado como: {userPermission} (ID: {userId})
            </span>
          </nav>
        )}
      </header>
      <main>{renderPage()}</main>
      <footer>
        <p>&copy; 2025 Sistema de Vendas</p>
      </footer>
    </div>
  );
}

export default App;
