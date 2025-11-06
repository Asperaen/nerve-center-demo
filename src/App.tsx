import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ExternalPulsePage from './pages/ExternalPulsePage';
import InternalPulsePage from './pages/InternalPulsePage';
import FinancePage from './pages/FinancePage';
import ActionTrackerPage from './pages/ActionTrackerPage';
import UserProfile from './pages/UserProfile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path='/'
          element={<MainLayout />}>
          <Route
            index
            element={
              <Navigate
                to='/external-pulse'
                replace
              />
            }
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
            path='action-tracker'
            element={<ActionTrackerPage />}
          />
          <Route
            path='profile'
            element={<UserProfile />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
