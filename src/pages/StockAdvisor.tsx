import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, TrendingUp } from "lucide-react";

export default function StockAdvisor() {
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    symbol: "",
    shares: "",
    purchase_price: "",
    purchase_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  useEffect(() => {
    loadStocks();
  }, []);

  const loadStocks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("stocks")
      .select("*")
      .eq("user_id", user.id)
      .order("purchase_date", { ascending: false });

    if (error) {
      toast.error("Failed to load stocks");
    } else {
      setStocks(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("stocks").insert({
      user_id: user.id,
      ...formData,
      shares: parseFloat(formData.shares),
      purchase_price: parseFloat(formData.purchase_price),
    });

    if (error) {
      toast.error("Failed to add stock");
    } else {
      toast.success("Stock added successfully");
      setOpen(false);
      setFormData({ symbol: "", shares: "", purchase_price: "", purchase_date: new Date().toISOString().split("T")[0], notes: "" });
      loadStocks();
    }
  };

  const deleteStock = async (id: string) => {
    const { error } = await supabase.from("stocks").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete stock");
    } else {
      toast.success("Stock removed");
      loadStocks();
    }
  };

  const totalValue = stocks.reduce((sum, stock) => 
    sum + (parseFloat(stock.shares) * parseFloat(stock.purchase_price)), 0
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Stock Portfolio</h1>
            <p className="text-muted-foreground">Track your investment portfolio</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Stock
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Stock to Portfolio</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="symbol">Stock Symbol</Label>
                  <Input
                    id="symbol"
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                    placeholder="AAPL"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="shares">Number of Shares</Label>
                  <Input
                    id="shares"
                    type="number"
                    step="0.0001"
                    value={formData.shares}
                    onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="purchase_price">Purchase Price per Share</Label>
                  <Input
                    id="purchase_price"
                    type="number"
                    step="0.01"
                    value={formData.purchase_price}
                    onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="purchase_date">Purchase Date</Label>
                  <Input
                    id="purchase_date"
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full">Add to Portfolio</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Portfolio Summary</span>
              <span className="text-2xl font-bold text-secondary">${totalValue.toFixed(2)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stocks.map((stock) => {
                const value = parseFloat(stock.shares) * parseFloat(stock.purchase_price);
                return (
                  <div key={stock.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-primary/10 p-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold">{stock.symbol}</p>
                        <p className="text-sm text-muted-foreground">
                          {parseFloat(stock.shares).toFixed(4)} shares @ ${parseFloat(stock.purchase_price).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Purchased {new Date(stock.purchase_date).toLocaleDateString()}
                        </p>
                        {stock.notes && <p className="text-xs text-muted-foreground italic">{stock.notes}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-lg font-bold">${value.toFixed(2)}</p>
                      <Button variant="ghost" size="icon" onClick={() => deleteStock(stock.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              {stocks.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No stocks in portfolio</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}