import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MeetingDetailView from './components/MeetingDetailView';
import { ActionsProvider } from './contexts/ActionsContext';
import MainLayout from './layouts/MainLayout';
import ActionTrackerPage from './pages/ActionTrackerPage';
import BusinessGroupPerformancePage from './pages/BusinessGroupPerformancePage';
import ExecutiveSummaryPage from './pages/ExecutiveSummaryPage';
import ExternalPulsePage from './pages/ExternalPulsePage';
import FinancePage from './pages/FinancePage';
import FinanceReviewPage from './pages/FinanceReviewPage';
import IdeationProgressPage from './pages/IdeationProgressPage';
import InternalPulsePage from './pages/InternalPulsePage';
import MarketIntelligencePage from './pages/MarketIntelligencePage';
import MyMeetingsPage from './pages/MyMeetingsPage';
import PowerBIPage from './pages/PowerBIPage';
import UserProfile from './pages/UserProfile';
import WaveExecutiveDashboardPage from './pages/WaveExecutiveDashboardPage';

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
              path='finance'
              element={<FinancePage />}
            />
            <Route
              path='finance-review'
              element={<FinanceReviewPage />}
            />
            <Route
              path='action-tracker'
              element={<ActionTrackerPage />}
            />
            <Route
              path='my-meetings'
              element={<MyMeetingsPage />}
            />
            <Route
              path='profile'
              element={<UserProfile />}
            />
            <Route
              path='meeting/:meetingId'
              element={<MeetingDetailView />}
            />
            <Route
              path='powerbi'
              element={<PowerBIPage />}
            />
            <Route
              path='business-group-performance'
              element={<BusinessGroupPerformancePage />}
            />
            <Route
              path='wave-dashboard'
              element={<WaveExecutiveDashboardPage />}
            />
            <Route
              path='market-intelligence'
              element={<MarketIntelligencePage />}
            />
            <Route
              path='ideation-progress'
              element={<IdeationProgressPage />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </ActionsProvider>
  );
}

export default App;
