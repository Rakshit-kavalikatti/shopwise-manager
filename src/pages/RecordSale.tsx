import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { ArrowLeft } from "lucide-react";

interface Product {
  id: string;
  name: string;
  buying_price: number;
  selling_price: number;
  stock_quantity: number;
}

const RecordSale = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .gt("stock_quantity", 0)
      .order("name");
    
    setProducts(data || []);
  };

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const calculateSale = () => {
    if (!selectedProduct || !quantity) return null;
    const qty = parseInt(quantity);
    const totalAmount = selectedProduct.selling_price * qty;
    const profit = (selectedProduct.selling_price - selectedProduct.buying_price) * qty;
    return { totalAmount, profit };
  };

  const sale = calculateSale();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct || !quantity) {
      toast.error("Please select a product and enter quantity");
      return;
    }

    const qty = parseInt(quantity);
    
    if (qty > selectedProduct.stock_quantity) {
      toast.error(`Only ${selectedProduct.stock_quantity} units available in stock`);
      return;
    }

    if (qty <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    // Record sale
    const { error: saleError } = await supabase.from("sales").insert({
      user_id: user.id,
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,
      quantity: qty,
      selling_price_at_sale: selectedProduct.selling_price,
      buying_price_at_sale: selectedProduct.buying_price,
      total_amount: sale!.totalAmount,
      profit_for_sale: sale!.profit,
    });

    if (saleError) {
      toast.error("Failed to record sale: " + saleError.message);
      setLoading(false);
      return;
    }

    // Update stock
    const { error: stockError } = await supabase
      .from("products")
      .update({ stock_quantity: selectedProduct.stock_quantity - qty })
      .eq("id", selectedProduct.id);

    if (stockError) {
      toast.error("Failed to update stock: " + stockError.message);
    } else {
      toast.success("Sale recorded successfully!");
      navigate("/");
    }
    setLoading(false);
  };

  return (
    <Layout>
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Record Sale</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Select Product *</Label>
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} (Stock: {product.stock_quantity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProduct && (
                <div className="p-3 bg-muted rounded-lg space-y-1">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Selling Price:</span>{" "}
                    <span className="font-medium">₹{selectedProduct.selling_price}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Available Stock:</span>{" "}
                    <span className="font-medium">{selectedProduct.stock_quantity} units</span>
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  placeholder="Enter quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>

              {sale && (
                <div className="p-4 bg-primary/10 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Amount:</span>
                    <span className="font-bold text-lg">₹{sale.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Profit from this sale:</span>
                    <span className="font-bold text-lg text-success">₹{sale.profit.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => navigate("/")}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={loading || !selectedProduct || !quantity}>
                  {loading ? "Recording..." : "Record Sale"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default RecordSale;
