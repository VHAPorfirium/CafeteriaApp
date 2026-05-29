/**
 * Configuração do router (react-router v6).
 *
 * Dois layouts:
 * - `PublicLayout` — header com nav + Outlet + CartDrawer (cliente)
 * - `AdminLayout` — sidebar dark + Outlet (admin)
 *
 * Rotas protegidas via `<ProtectedRoute>` redirecionam para /login.
 * Rotas admin exigem `requireAdmin` e redirecionam não-admins para /.
 */
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { TopNav } from '@/components/layout/TopNav';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { CartDrawer } from '@/components/features/CartDrawer';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Home } from '@/pages/Home';
import { ProductDetail } from '@/pages/ProductDetail';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Profile } from '@/pages/Profile';
import { Checkout } from '@/pages/Checkout';
import { Favorites } from '@/pages/Favorites';
import { MyOrders } from '@/pages/MyOrders';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminProducts } from '@/pages/admin/AdminProducts';
import { AdminOrders } from '@/pages/admin/AdminOrders';

function PublicLayout() {
  return (
    <div className="cg cg-paper" style={{ minHeight: '100vh' }}>
      <TopNav />
      <Outlet />
      <CartDrawer />
    </div>
  );
}

function AdminLayout() {
  return (
    <div className="cg" style={{ minHeight: '100vh', display: 'flex' }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: '32px 48px', background: 'var(--c-bg)' }}>
        <Outlet />
      </main>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/produto/:id', element: <ProductDetail /> },
      { path: '/login', element: <Login /> },
      { path: '/registro', element: <Register /> },
      { path: '/perfil', element: <ProtectedRoute><Profile /></ProtectedRoute> },
      { path: '/checkout', element: <ProtectedRoute><Checkout /></ProtectedRoute> },
      { path: '/favoritos', element: <ProtectedRoute><Favorites /></ProtectedRoute> },
      { path: '/meus-pedidos', element: <ProtectedRoute><MyOrders /></ProtectedRoute> },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requireAdmin>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'produtos', element: <AdminProducts /> },
      { path: 'pedidos', element: <AdminOrders /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
