import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ActionsProvider } from './contexts/ActionsContext';
import MainLayout from './layouts/MainLayout';
import ExecutiveSummaryPage from './pages/ExecutiveSummaryPage';
import ExternalPulsePage from './pages/ExternalPulsePage';
import InternalPulsePage from './pages/InternalPulsePage';
import WaveExecutiveDashboardPage from './pages/WaveExecutiveDashboardPage';
import FinancePage from './pages/FinancePage';
import FinanceReviewPage from './pages/FinanceReviewPage';
import UserProfile from './pages/UserProfile';
import MeetingDetailView from './components/MeetingDetailView';

function App() {
  return (
    <ActionsProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path='/'
            element={<MainLayout />}>
            <Route
              index
              element={<ExecutiveSummaryPage />}
            />
            <Route
              path='external-pulse'
              element={<ExternalPulsePage />}
            />
            <Route
              path='internal-pulse'
              element={<InternalPulsePage />}
            />
            <Route
              path='wave-executive-dashboard'
              element={<WaveExecutiveDashboardPage />}
            />
            <Route
              path='finance'
              element={<FinancePage />}
            />
            <Route
              path='finance-review'
              element={<FinanceReviewPage />}
            />
            <Route
              path='profile'
              element={<UserProfile />}
            />
            <Route
              path='meeting/:meetingId'
              element={<MeetingDetailView />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </ActionsProvider>
  );
}

export default App;
