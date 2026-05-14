import { Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import Login from "./pages/Login";
import Overview from "./pages/Overview";
import Orders from "./pages/Orders";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import { Toaster } from "react-hot-toast";
import Category from "./pages/Category";
import SubCategories from "./pages/SubCategories";
import SubCategoryProducts from "./pages/SubCategoryProducts";
import Reviews from "./pages/Reviews.jsx";
import AboutAs from "./pages/AboutAs.jsx";
import ContactMessage from "./pages/ContactMessage.jsx";
import ContactInfo from "./pages/ContactInfo.jsx";
import Home from "./pages/Home.jsx";
import Coupons from "./pages/Coupons.jsx";
import CompanyService from "./pages/CompanyService.jsx";
import CompanyFeatures from "./pages/CompanyFeatures.jsx";
import CompanyOrders from "./pages/CompanyOrders.jsx";
import ProductTypes from "./pages/ProductTypes.jsx";
import ArtisticBoards from "./pages/ArtisticBoards.jsx";
import CompanyInformation from "./pages/CompanyInformation.jsx";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Overview />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="category" element={<Category />} />
          <Route path="category/:id" element={<Category />} />
          <Route
            path="category/:categoryId/subcategories"
            element={<SubCategories />}
          />
          <Route
            path="category/:categoryId/subcategories/:subCategoryId/products"
            element={<SubCategoryProducts />}
          />
          <Route path="orders" element={<Orders />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<Settings />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="about" element={<AboutAs />} />
          <Route path="home" element={<Home />} />
          <Route path="contact-messages" element={<ContactMessage />} />
          <Route path="contact-info" element={<ContactInfo />} />
          <Route path="partner-services" element={<CompanyService />} />
          <Route path="partner-features" element={<CompanyFeatures />} />
          <Route path="partner-orders" element={<CompanyOrders />} />
          <Route path="product-types" element={<ProductTypes />} />
          <Route path="artistic-boards" element={<ArtisticBoards />} />
          <Route path="company-info" element={<CompanyInformation />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
