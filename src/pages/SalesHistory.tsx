import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { cn } from "@/lib/utils";

interface Sale {
  id: string;
  product_name: string;
  quantity: number;
  selling_price_at_sale: number;
  total_amount: number;
  profit_for_sale: number;
  date: string;
}

const SalesHistory = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (error) {
      toast.error("Failed to load sales");
    } else {
      setSales(data || []);
      setFilteredSales(data || []);
    }
    setLoading(false);
  };

  const filterByToday = () => {
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    
    const filtered = sales.filter((sale) => {
      const saleDate = new Date(sale.date);
      return saleDate >= todayStart && saleDate <= todayEnd;
    });
    setFilteredSales(filtered);
  };

  const filterByWeek = () => {
    const today = new Date();
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);
    
    const filtered = sales.filter((sale) => {
      const saleDate = new Date(sale.date);
      return saleDate >= weekStart && saleDate <= weekEnd;
    });
    setFilteredSales(filtered);
  };

  const filterByMonth = () => {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    
    const filtered = sales.filter((sale) => {
      const saleDate = new Date(sale.date);
      return saleDate >= monthStart && saleDate <= monthEnd;
    });
    setFilteredSales(filtered);
  };

  const filterByCustomRange = () => {
    if (!dateFrom || !dateTo) {
      toast.error("Please select both start and end dates");
      return;
    }
    
    const filtered = sales.filter((sale) => {
      const saleDate = new Date(sale.date);
      return saleDate >= startOfDay(dateFrom) && saleDate <= endOfDay(dateTo);
    });
    setFilteredSales(filtered);
  };

  const showAll = () => {
    setFilteredSales(sales);
  };

  const totalAmount = filteredSales.reduce((sum, sale) => sum + sale.total_amount, 0);
  const totalProfit = filteredSales.reduce((sum, sale) => sum + sale.profit_for_sale, 0);

  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Sales History</h1>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all" onClick={showAll}>All</TabsTrigger>
            <TabsTrigger value="today" onClick={filterByToday}>Today</TabsTrigger>
            <TabsTrigger value="week" onClick={filterByWeek}>Week</TabsTrigger>
            <TabsTrigger value="month" onClick={filterByMonth}>Month</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>

          <TabsContent value="custom" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">From Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateFrom && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateFrom}
                          onSelect={setDateFrom}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">To Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateTo && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateTo}
                          onSelect={setDateTo}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <Button onClick={filterByCustomRange} className="w-full sm:w-auto">
                    Apply Filter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">₹{totalAmount.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">₹{totalProfit.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Sales List */}
        <div className="space-y-2">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : filteredSales.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No sales found for the selected period
              </CardContent>
            </Card>
          ) : (
            filteredSales.map((sale) => (
              <Card key={sale.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">{sale.product_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(sale.date), "PPP")}
                      </p>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span>Qty: {sale.quantity}</span>
                        <span>₹{sale.selling_price_at_sale}/unit</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">₹{sale.total_amount.toFixed(2)}</p>
                      <p className="text-sm text-success">
                        Profit: ₹{sale.profit_for_sale.toFixed(2)}
                      </p>
                    </div>
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

export default SalesHistory;
