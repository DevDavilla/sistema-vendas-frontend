import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import LoginPage from "./components/LoginPage";

import ProductsPage from "./pages/ProductsPage";
import ClientsPage from "./pages/ClientsPage";
import UsersPage from "./pages/UsersPage";
import SalesPage from "./pages/SalesPage";
import ReportsPage from "./pages/ReportsPage";

import { BACKEND_BASE_URL, getAuthHeaders } from "./utils/authUtils";

interface User {
  id: number;
  nome_usuario?: string;
  permissao?: string;
}
// --- Componente principal App ---
function App() {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [userPermission, setUserPermission] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState("products");

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
    setCurrentPage("products");
    toast.success("Login bem-sucedido!");
  };

  const handleLogout = () => {
    setToken(null);
    setUserId(null);
    setUserPermission(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userPermission");
    setCurrentPage("products");
    toast.info("Você foi desconectado.");
  };

  const renderPage = () => {
    if (!token) {
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
      />
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
