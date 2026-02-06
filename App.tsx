import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth, ProtectedRoute } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Personnel } from './pages/Personnel';
import { Operations } from './pages/Operations';
import { Logistics } from './pages/Logistics';
import { Login } from './pages/Login';

// Componente para verificar autenticação e redirecionar
function RequireAuth({ children }: { children: JSX.Element }): JSX.Element {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirecionar para login, salvando a localização atual
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// Rotas da aplicação
function AppRoutes(): JSX.Element {
  return (
    <Routes>
      {/* Rota de Login (pública) */}
      <Route path="/login" element={<Login />} />

      {/* Rotas protegidas */}
      <Route
        path="/"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />

        {/* P/1 - Pessoal (Comandante, Admin, Chefe P/1) */}
        <Route
          path="p1"
          element={
            <ProtectedRoute secoesPermitidas={['P/1']}>
              <Personnel />
            </ProtectedRoute>
          }
        />

        {/* P/3 - Operações (Comandante, Admin, Chefe P/3) */}
        <Route
          path="p3"
          element={
            <ProtectedRoute secoesPermitidas={['P/3']}>
              <Operations />
            </ProtectedRoute>
          }
        />

        {/* P/4 - Logística (Comandante, Admin, Chefe P/4) */}
        <Route
          path="p4"
          element={
            <ProtectedRoute secoesPermitidas={['P/4']}>
              <Logistics />
            </ProtectedRoute>
          }
        />

        {/* Qualquer rota não encontrada */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </HashRouter>
  );
};

export default App;
