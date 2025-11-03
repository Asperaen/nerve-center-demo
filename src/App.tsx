import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
// import DashboardOverview from './pages/DashboardOverview'; // Hidden for now - kept for future use
import MarketPulse from './pages/MarketPulse';
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
                to='/market-pulse'
                replace
              />
            }
          />
          {/* Dashboard hidden for now - kept for future use */}
          {/* <Route
            path='dashboard'
            element={<DashboardOverview />}
          /> */}
          <Route
            path='market-pulse'
            element={<MarketPulse />}
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
