import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardOverview from './pages/DashboardOverview';
import CEODailyDigest from './pages/CEODailyDigest';
import BusinessAssumptions from './pages/BusinessAssumptions';
import FinancialForecast from './pages/FinancialForecast';
import ScenarioSimulation from './pages/ScenarioSimulation';

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
                to='/dashboard'
                replace
              />
            }
          />
          <Route
            path='dashboard'
            element={<DashboardOverview />}
          />
          <Route
            path='daily-digest'
            element={<CEODailyDigest />}
          />
          <Route
            path='assumptions'
            element={<BusinessAssumptions />}
          />
          <Route
            path='forecast'
            element={<FinancialForecast />}
          />
          <Route
            path='scenarios'
            element={<ScenarioSimulation />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
