import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import BrokerLogin from "./pages/BrokerLogin";
import BrokerSignup from "./pages/BrokerSignup";
import BrokerDashboard from "./pages/BrokerDashboard";
import BrokerAccountDetail from "./pages/BrokerAccountDetail";
import BrokerProfile from "./pages/broker/BrokerProfile";
import BrokerSecurity from "./pages/broker/BrokerSecurity";
import BrokerAgreements from "./pages/broker/BrokerAgreements";
import BrokerDocuments from "./pages/broker/BrokerDocuments";
import BrokerAccounts from "./pages/broker/BrokerAccounts";
import BrokerAffiliate from "./pages/broker/BrokerAffiliate";
import BrokerReports from "./pages/broker/BrokerReports";
import BrokerSupport from "./pages/broker/BrokerSupport";
import BrokerOpenAccount from "./pages/broker/BrokerOpenAccount";
import BrokerWithdraw from "./pages/broker/BrokerWithdraw";
import BrokerTools from "./pages/broker/BrokerTools";
import AdminDashboard from "./pages/AdminDashboard";
import AdminFinance from "./pages/admin/AdminFinance";
import AdminCompliance from "./pages/admin/AdminCompliance";
import AdminDataImport from "./pages/admin/AdminDataImport";
import BrokerAdminDashboard from "./pages/BrokerAdminDashboard";
import NotFound from "./pages/NotFound";
import ChatWidget from "./components/ChatWidget";

const queryClient = new QueryClient();

const ChatWidgetWrapper = () => {
  const location = useLocation();
  const hiddenRoutes = ["/admin", "/admin/finance", "/admin/compliance", "/broker-admin"];
  const isHidden = hiddenRoutes.some(route => location.pathname === route || location.pathname.startsWith("/admin") || location.pathname.startsWith("/broker-admin"));
  if (isHidden) {
    return null;
  }
  return <ChatWidget />;
};

const AppRoutes = () => (
  <>
    <ChatWidgetWrapper />
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<BrokerLogin />} />
      <Route path="/signup" element={<BrokerSignup />} />
      <Route path="/dashboard" element={<BrokerDashboard />} />
      <Route path="/account/:accountId" element={<BrokerAccountDetail />} />
      <Route path="/profile" element={<BrokerProfile />} />
      <Route path="/security" element={<BrokerSecurity />} />
      <Route path="/agreements" element={<BrokerAgreements />} />
      <Route path="/documents" element={<BrokerDocuments />} />
      <Route path="/accounts/live" element={<BrokerAccounts />} />
      <Route path="/accounts/demo" element={<BrokerAccounts />} />
      <Route path="/accounts/archived" element={<BrokerAccounts />} />
      <Route path="/accounts/open" element={<BrokerOpenAccount />} />
      <Route path="/withdraw" element={<BrokerWithdraw />} />
      <Route path="/tools" element={<BrokerTools />} />
      <Route path="/affiliate/apply" element={<BrokerAffiliate />} />
      <Route path="/reports/payouts" element={<BrokerReports />} />
      <Route path="/reports/trades" element={<BrokerReports />} />
      <Route path="/reports/summary" element={<BrokerReports />} />
      <Route path="/support/downloads" element={<BrokerSupport />} />
      <Route path="/support/faq/general" element={<BrokerSupport />} />
      <Route path="/support/faq/trading" element={<BrokerSupport />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/finance" element={<AdminFinance />} />
      <Route path="/admin/compliance" element={<AdminCompliance />} />
      <Route path="/admin/import" element={<AdminDataImport />} />
      <Route path="/broker-admin" element={<BrokerAdminDashboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
