import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Plus, TrendingUp, AlertCircle, Package } from "lucide-react";
import Layout from "@/components/Layout";
import { toast } from "sonner";

interface Stats {
  todaySales: number;
  todayProfit: number;
  todayExpenses: number;
  netProfit: number;
  totalProducts: number;
  lowStockCount: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    todaySales: 0,
    todayProfit: 0,
    todayExpenses: 0,
    netProfit: 0,
    totalProducts: 0,
    lowStockCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }
    await loadStats();
  };

  const loadStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get today's sales
      const { data: salesData } = await supabase
        .from("sales")
        .select("total_amount, profit_for_sale")
        .gte("date", today.toISOString());

      const todaySales = salesData?.reduce((sum, sale) => sum + parseFloat(sale.total_amount.toString()), 0) || 0;
      const todayProfit = salesData?.reduce((sum, sale) => sum + parseFloat(sale.profit_for_sale.toString()), 0) || 0;

      // Get today's expenses
      const { data: expensesData } = await supabase
        .from("expenses")
        .select("amount")
        .gte("date", today.toISOString());

      const todayExpenses = expensesData?.reduce((sum, expense) => sum + parseFloat(expense.amount.toString()), 0) || 0;

      // Get product stats
      const { data: productsData } = await supabase
        .from("products")
        .select("stock_quantity");

      const totalProducts = productsData?.length || 0;
      const lowStockCount = productsData?.filter(p => p.stock_quantity < 10).length || 0;

      setStats({
        todaySales,
        todayProfit,
        todayExpenses,
        netProfit: todayProfit - todayExpenses,
        totalProducts,
        lowStockCount,
      });
    } catch (error: any) {
      toast.error("Failed to load stats: " + error.message);
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

  return (
    <Layout>
      <div className="space-y-6">
        {/* Today's Summary */}
        <div>
          <h2 className="text-xl font-bold mb-4">Today's Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">₹{stats.todaySales.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">₹{stats.todayProfit.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">₹{stats.todayExpenses.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                  ₹{stats.netProfit.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Stats */}
        <div>
          <h2 className="text-xl font-bold mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate("/products")}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 rounded-full p-3">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalProducts}</p>
                    <p className="text-sm text-muted-foreground">Total Products</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate("/products")}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="bg-destructive/10 rounded-full p-3">
                    <AlertCircle className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.lowStockCount}</p>
                    <p className="text-sm text-muted-foreground">Low Stock</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Button 
              className="w-full h-14 text-lg" 
              size="lg"
              onClick={() => navigate("/sales/record")}
            >
              <Plus className="h-5 w-5 mr-2" />
              Record Sale
            </Button>
            <Button 
              className="w-full h-14 text-lg" 
              variant="secondary"
              size="lg"
              onClick={() => navigate("/products/add")}
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Product
            </Button>
            <Button 
              className="w-full h-14 text-lg" 
              variant="outline"
              size="lg"
              onClick={() => navigate("/expenses/add")}
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Expense
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
