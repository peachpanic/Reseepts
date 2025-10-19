import { useExpenses } from "@/hooks/useExpenses";

export function ExpenseList() {
  const { data: expenses, isLoading, error } = useExpenses("1");
  if (isLoading) return <>Loading...</>;
  if (error) return <>Error: {error.message}</>;
  return (
    <ul>
      <h1>Perfect</h1>
    </ul>
  );
}
