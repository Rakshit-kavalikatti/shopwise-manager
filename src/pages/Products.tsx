import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, AlertCircle } from "lucide-react";
import Layout from "@/components/Layout";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  buying_price: number;
  selling_price: number;
  stock_quantity: number;
  category: string | null;
}

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name");

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast.error("Failed to load products: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateProfit = (selling: number, buying: number) => {
    return (selling - buying).toFixed(2);
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Products</h1>
          <Button onClick={() => navigate("/products/add")}>
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Products List */}
        <div className="space-y-3">
          {filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No products found. Add your first product!
              </CardContent>
            </Card>
          ) : (
            filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => navigate(`/products/${product.id}`)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        {product.stock_quantity < 10 && (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                      {product.category && (
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                      )}
                      <div className="mt-2 space-y-1">
                        <p className="text-sm">
                          <span className="text-muted-foreground">Stock:</span>{" "}
                          <span className={product.stock_quantity < 10 ? "text-destructive font-medium" : "font-medium"}>
                            {product.stock_quantity} units
                          </span>
                        </p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">Selling Price:</span>{" "}
                          <span className="font-medium">₹{product.selling_price}</span>
                        </p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">Profit/Unit:</span>{" "}
                          <span className="font-medium text-success">
                            ₹{calculateProfit(product.selling_price, product.buying_price)}
                          </span>
                        </p>
                      </div>
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

export default Products;
