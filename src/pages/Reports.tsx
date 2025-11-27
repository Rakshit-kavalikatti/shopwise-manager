import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, format, subDays, eachDayOfInterval, subMonths, eachMonthOfInterval } from "date-fns";

interface Sale {
  product_name: string;
  quantity: number;
  profit_for_sale: number;
  total_amount: number;
  date: string;
}

interface Expense {
  amount: number;
  date: string;
}

const Reports = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [salesResult, expensesResult] = await Promise.all([
      supabase.from("sales").select("*").eq("user_id", user.id),
      supabase.from("expenses").select("*").eq("user_id", user.id)
    ]);

    if (salesResult.error) {
      toast.error("Failed to load sales data");
    } else {
      setSales(salesResult.data || []);
    }

    if (expensesResult.error) {
      toast.error("Failed to load expenses data");
    } else {
      setExpenses(expensesResult.data || []);
    }

    setLoading(false);
  };

  const filterSalesByPeriod = (start: Date, end: Date) => {
    return sales.filter((sale) => {
      const saleDate = new Date(sale.date);
      return saleDate >= start && saleDate <= end;
    });
  };

  const filterExpensesByPeriod = (start: Date, end: Date) => {
    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= start && expenseDate <= end;
    });
  };

  const calculateMetrics = (filteredSales: Sale[], filteredExpenses: Expense[]) => {
    const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total_amount, 0);
    const totalProfit = filteredSales.reduce((sum, sale) => sum + sale.profit_for_sale, 0);
    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const netProfit = totalProfit - totalExpenses;
    return { totalSales, totalProfit, totalExpenses, netProfit };
  };

  const getProductPerformance = (filteredSales: Sale[]) => {
    const productMap = new Map();
    filteredSales.forEach((sale) => {
      const existing = productMap.get(sale.product_name) || { quantity: 0, profit: 0 };
      productMap.set(sale.product_name, {
        quantity: existing.quantity + sale.quantity,
        profit: existing.profit + sale.profit_for_sale,
      });
    });

    return Array.from(productMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  };

  const getDailyProfitData = (days: number) => {
    const today = new Date();
    const dates = eachDayOfInterval({ start: subDays(today, days - 1), end: today });
    
    return dates.map((date) => {
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      const daySales = filterSalesByPeriod(dayStart, dayEnd);
      const dayExpenses = filterExpensesByPeriod(dayStart, dayEnd);
      const { netProfit } = calculateMetrics(daySales, dayExpenses);
      
      return {
        date: format(date, "MMM dd"),
        profit: netProfit,
      };
    });
  };

  const getMonthlyProfitData = () => {
    const today = new Date();
    const dates = eachMonthOfInterval({ start: subMonths(today, 11), end: today });
    
    return dates.map((date) => {
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      const monthSales = filterSalesByPeriod(monthStart, monthEnd);
      const monthExpenses = filterExpensesByPeriod(monthStart, monthEnd);
      const { netProfit } = calculateMetrics(monthSales, monthExpenses);
      
      return {
        month: format(date, "MMM"),
        profit: netProfit,
      };
    });
  };

  const renderReport = (title: string, start: Date, end: Date, profitData: any[]) => {
    const filteredSales = filterSalesByPeriod(start, end);
    const filteredExpenses = filterExpensesByPeriod(start, end);
    const metrics = calculateMetrics(filteredSales, filteredExpenses);
    const productPerformance = getProductPerformance(filteredSales);

    const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{title}</h2>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">₹{metrics.totalSales.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">₹{metrics.totalProfit.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">₹{metrics.totalExpenses.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${metrics.netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                ₹{metrics.netProfit.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profit Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Profit Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                profit: {
                  label: "Profit",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={profitData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={profitData[0]?.date ? "date" : "month"} />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="profit" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Products */}
        {productPerformance.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Products by Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  quantity: {
                    label: "Quantity Sold",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productPerformance}
                      dataKey="quantity"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) => entry.name}
                    >
                      {productPerformance.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      </Layout>
    );
  }

  const today = new Date();

  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Reports</h1>

        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>

          <TabsContent value="daily">
            {renderReport(
              "Daily Report",
              startOfDay(today),
              endOfDay(today),
              getDailyProfitData(7)
            )}
          </TabsContent>

          <TabsContent value="weekly">
            {renderReport(
              "Weekly Report",
              startOfWeek(today),
              endOfWeek(today),
              getDailyProfitData(7)
            )}
          </TabsContent>

          <TabsContent value="monthly">
            {renderReport(
              "Monthly Report",
              startOfMonth(today),
              endOfMonth(today),
              getDailyProfitData(30)
            )}
          </TabsContent>

          <TabsContent value="yearly">
            {renderReport(
              "Yearly Report",
              startOfYear(today),
              endOfYear(today),
              getMonthlyProfitData()
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Reports;
