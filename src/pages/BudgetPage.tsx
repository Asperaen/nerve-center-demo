import ExecutiveSummaryPage from './ExecutiveSummaryPage';

export default function BudgetPage() {
  return (
    <ExecutiveSummaryPage
      isBudgetView
      defaultHomeToggle='full-year'
      pageTitle='Budget'
    />
  );
}
