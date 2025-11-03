import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
// import DashboardOverview from './pages/DashboardOverview'; // Hidden for now - kept for future use
import AnnualBudgetTarget from './pages/AnnualBudgetTarget';
import DailyPulseCheck from './pages/DailyPulseCheck';
import WeeklyFinancialForecast from './pages/WeeklyFinancialForecast';
import MonthlyFinancialReview from './pages/MonthlyFinancialReview';

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
                to='/annual-budget-target'
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
            path='annual-budget-target'
            element={<AnnualBudgetTarget />}
          />
          <Route
            path='daily-pulse-check'
            element={<DailyPulseCheck />}
          />
          <Route
            path='weekly-forecast'
            element={<WeeklyFinancialForecast />}
          />
          <Route
            path='monthly-review'
            element={<MonthlyFinancialReview />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
