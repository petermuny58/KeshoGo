import { Routes, Route } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { PageShell } from './components/layout/PageShell';
import { EmptyState } from './components/common/EmptyState';
import { Home } from './pages/Home';
import { CategoryIndex } from './pages/CategoryIndex';
import { CategoryListing } from './pages/CategoryListing';
import { ProductDetail } from './pages/ProductDetail';
import { SearchResults } from './pages/SearchResults';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Reels } from './pages/Reels';
import { Trends } from './pages/Trends';
import { Profile } from './pages/Profile';
import { StorePage } from './pages/StorePage';
import { CreateStore } from './pages/CreateStore';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { SellerShell } from './components/layout/SellerShell';
import { DashboardOverview } from './pages/dashboard/DashboardOverview';
import { SellerProducts } from './pages/dashboard/SellerProducts';
import { SellerOrders } from './pages/dashboard/SellerOrders';
import { SellerEarnings } from './pages/dashboard/SellerEarnings';
import { SellerAnalytics } from './pages/dashboard/SellerAnalytics';
import { SellerReviews } from './pages/dashboard/SellerReviews';
import { SellerSettings } from './pages/dashboard/SellerSettings';
import { SellerReels } from './pages/dashboard/SellerReels';

function NotFound() {
  return (
    <div className="mx-auto max-w-md">
      <EmptyState
        icon={Compass}
        title="This page wandered off"
        description="Let's get you back to shopping."
        actionLabel="Back to home"
        actionHref="/"
      />
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/login/*" element={<Login />} />
      <Route path="/signup/*" element={<SignUp />} />

      <Route element={<PageShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/categories" element={<CategoryIndex />} />
        <Route path="/category/:slug" element={<CategoryListing />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/reels" element={<Reels />} />
        <Route path="/trends" element={<Trends />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/store/:slug" element={<StorePage />} />
        <Route path="/create-store" element={<CreateStore />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/dashboard" element={<SellerShell />}>
        <Route index element={<DashboardOverview />} />
        <Route path="products" element={<SellerProducts />} />
        <Route path="orders" element={<SellerOrders />} />
        <Route path="earnings" element={<SellerEarnings />} />
        <Route path="analytics" element={<SellerAnalytics />} />
        <Route path="reviews" element={<SellerReviews />} />
        <Route path="reels" element={<SellerReels />} />
        <Route path="settings" element={<SellerSettings />} />
      </Route>
    </Routes>
  );
}
