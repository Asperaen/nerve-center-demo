import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MeetingDetailView from './components/MeetingDetailView';
import { ActionsProvider } from './contexts/ActionsContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BudgetProvider } from './contexts/BudgetContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import MainLayout from './layouts/MainLayout';
import ActionTrackerPage from './pages/ActionTrackerPage';
import ActualInitiativeImplementationPage from './pages/ActualInitiativeImplementationPage';
import BudgetPage from './pages/BudgetPage';
import BusinessGroupPerformancePage from './pages/BusinessGroupPerformancePage';
import BusinessUnitPerformanceByFunctionPage from './pages/BusinessUnitPerformanceByFunctionPage';
import ExecutiveSummaryPage from './pages/ExecutiveSummaryPage';
import ExternalPulsePage from './pages/ExternalPulsePage';
import FinancePage from './pages/FinancePage';
import FinanceReviewPage from './pages/FinanceReviewPage';
import IdeationProgressPage from './pages/IdeationProgressPage';
import InternalPulsePage from './pages/InternalPulsePage';
import LoginPage from './pages/LoginPage';
import MarketIntelligencePage from './pages/MarketIntelligencePage';
import MyMeetingsPage from './pages/MyMeetingsPage';
import PowerBIPage from './pages/PowerBIPage';
import UserProfile from './pages/UserProfile';
import WaveExecutiveDashboardPage from './pages/WaveExecutiveDashboardPage';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <CurrencyProvider>
      <BudgetProvider>
        <ActionsProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <Routes>
              <Route path='/' element={<MainLayout />}>
                <Route index element={<ExecutiveSummaryPage />} />
                <Route path='external-pulse' element={<ExternalPulsePage />} />
                <Route path='internal-pulse' element={<InternalPulsePage />} />
                <Route path='finance' element={<FinancePage />} />
                <Route path='finance-review' element={<FinanceReviewPage />} />
                <Route path='action-tracker' element={<ActionTrackerPage />} />
                <Route path='my-meetings' element={<MyMeetingsPage />} />
                <Route path='profile' element={<UserProfile />} />
                <Route path='meeting/:meetingId' element={<MeetingDetailView />} />
                <Route path='powerbi' element={<PowerBIPage />} />
                <Route path='business-group-performance' element={<BusinessGroupPerformancePage />} />
                <Route path='actual-initiative-implementation' element={<ActualInitiativeImplementationPage />} />
                <Route path='business-unit-performance/functional-performance/:functionId' element={<BusinessUnitPerformanceByFunctionPage />} />
                <Route path='wave-dashboard' element={<WaveExecutiveDashboardPage />} />
                <Route path='market-intelligence' element={<MarketIntelligencePage />} />
                <Route path='budget' element={<BudgetPage />} />
                <Route path='initiative-performance' element={<IdeationProgressPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ActionsProvider>
      </BudgetProvider>
    </CurrencyProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
