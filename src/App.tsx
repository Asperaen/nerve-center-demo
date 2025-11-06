import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
import DailyPulseCheck from './pages/DailyPulseCheck';
import WeeklyFinancialForecast from './pages/WeeklyFinancialForecast';
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
            element={<LandingPage />}
          />
          <Route path='daily-pulse-check'>
            <Route
              index
              element={<DailyPulseCheck />}
            />
            <Route
              path='external'
              element={<DailyPulseCheck />}
            />
            <Route
              path='internal'
              element={<DailyPulseCheck />}
            />
            <Route
              path='actions'
              element={<DailyPulseCheck />}
            />
          </Route>
          <Route path='weekly-forecast'>
            <Route
              index
              element={<WeeklyFinancialForecast />}
            />
            <Route
              path='forecast'
              element={<WeeklyFinancialForecast />}
            />
            <Route
              path='assumptions'
              element={<WeeklyFinancialForecast />}
            />
            <Route
              path='actions'
              element={<WeeklyFinancialForecast />}
            />
          </Route>
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
