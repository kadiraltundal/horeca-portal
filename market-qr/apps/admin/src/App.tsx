import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Stores from './pages/Stores';
import Suppliers from './pages/Suppliers';
import StockMovements from './pages/StockMovements';
import PurchaseOrders from './pages/PurchaseOrders';
import Refunds from './pages/Refunds';
import CashDrawer from './pages/CashDrawer';
import ZReports from './pages/ZReports';
import Promotions from './pages/Promotions';
import Users from './pages/Users';
import Finance from './pages/Finance';
import WarehouseManagement from './pages/WarehouseManagement';
import Staff from './pages/Staff';
import Reports from './pages/Reports';
import Ecommerce from './pages/Ecommerce';
import Customers from './pages/Customers';
import Cms from './pages/Cms';
import Batches from './pages/Batches';
import Organizations from './pages/Organizations';
import Loyalty from './pages/Loyalty';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="stock-movements" element={<StockMovements />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="purchase-orders" element={<PurchaseOrders />} />
        <Route path="orders" element={<Orders />} />
        <Route path="refunds" element={<Refunds />} />
        <Route path="cash-drawer" element={<CashDrawer />} />
        <Route path="z-reports" element={<ZReports />} />
        <Route path="stores" element={<Stores />} />
        <Route path="promotions" element={<Promotions />} />
        <Route path="users" element={<Users />} />
        <Route path="finance" element={<Finance />} />
        <Route path="warehouse-management" element={<WarehouseManagement />} />
        <Route path="staff" element={<Staff />} />
        <Route path="reports" element={<Reports />} />
        <Route path="ecommerce" element={<Ecommerce />} />
        <Route path="customers" element={<Customers />} />
        <Route path="cms" element={<Cms />} />
        <Route path="batches" element={<Batches />} />
        <Route path="organizations" element={<Organizations />} />
        <Route path="loyalty" element={<Loyalty />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
