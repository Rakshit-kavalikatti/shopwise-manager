import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import { format } from "date-fns";

interface Expense {
  id: string;
  amount: number;
  category: string;
  note: string | null;
  date: string;
}

const Expenses = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error: any) {
      toast.error("Failed to load expenses: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount.toString()), 0);

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Expenses</h1>
          <Button onClick={() => navigate("/expenses/add")}>
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Expenses</p>
            <p className="text-3xl font-bold text-destructive">₹{totalExpenses.toFixed(2)}</p>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {expenses.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No expenses recorded yet
              </CardContent>
            </Card>
          ) : (
            expenses.map((expense) => (
              <Card key={expense.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{expense.category}</h3>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(expense.date), "MMM dd, yyyy")}
                        </span>
                      </div>
                      {expense.note && (
                        <p className="text-sm text-muted-foreground mt-1">{expense.note}</p>
                      )}
                    </div>
                    <p className="text-lg font-bold text-destructive">₹{expense.amount}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Expenses;
