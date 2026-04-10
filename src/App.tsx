import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy-loaded routes — each becomes its own JS chunk
const Auth              = lazy(() => import("./pages/Auth"));
const ResetPassword     = lazy(() => import("./pages/ResetPassword"));
const EmailConfirmation = lazy(() => import("./pages/EmailConfirmation"));
const Index             = lazy(() => import("./pages/Index"));
const PropertyManagement = lazy(() => import("./pages/PropertyManagement"));
const PropertiesForSale  = lazy(() => import("./pages/PropertiesForSale"));
const NotFound           = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/email-confirmation" element={<EmailConfirmation />} />
            <Route path="/" element={
              <ProtectedRoute>
                <SidebarProvider>
                  <Layout>
                    <Outlet />
                  </Layout>
                </SidebarProvider>
              </ProtectedRoute>
            }>
              <Route index element={<Index />} />
              <Route path="properties-for-sale" element={<PropertiesForSale />} />
              <Route path="property-management" element={<PropertyManagement />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
