import { Navigate, useSearchParams } from 'react-router-dom';

export default function BudgetPage() {
  const [searchParams] = useSearchParams();
  const buParam = searchParams.get('bu');

  const nextParams = new URLSearchParams();
  nextParams.set('toggle', 'budget');
  if (buParam) {
    nextParams.set('bu', buParam);
  }

  return (
    <Navigate
      to={`/business-group-performance?${nextParams.toString()}`}
      replace
    />
  );
}
