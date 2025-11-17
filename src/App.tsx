import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ActionsProvider } from './contexts/ActionsContext';
import MainLayout from './layouts/MainLayout';
import ExecutiveSummaryPage from './pages/ExecutiveSummaryPage';
import ExternalPulsePage from './pages/ExternalPulsePage';
import InternalPulsePage from './pages/InternalPulsePage';
import FinancePage from './pages/FinancePage';
import FinanceReviewPage from './pages/FinanceReviewPage';
import ActionTrackerPage from './pages/ActionTrackerPage';
import UserProfile from './pages/UserProfile';
import MeetingDetailView from './components/MeetingDetailView';
import MyMeetingsPage from './pages/MyMeetingsPage';

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
          </Route>
        </Routes>
      </BrowserRouter>
    </ActionsProvider>
  );
}

export default App;
