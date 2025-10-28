import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function TaxEstimate() {
  const [estimate, setEstimate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    total_income: "",
    total_deductions: "",
    notes: "",
  });

  useEffect(() => {
    loadTaxEstimate();
  }, []);

  const loadTaxEstimate = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const currentYear = new Date().getFullYear();
    const { data } = await supabase
      .from("tax_estimates")
      .select("*")
      .eq("user_id", user.id)
      .eq("year", currentYear)
      .single();

    if (data) {
      setEstimate(data);
      setFormData({
        year: data.year,
        total_income: data.total_income.toString(),
        total_deductions: data.total_deductions.toString(),
        notes: data.notes || "",
      });
    }
    setLoading(false);
  };

  const calculateTax = (income: number, deductions: number) => {
    const taxableIncome = Math.max(0, income - deductions);
    
    // Simplified progressive tax calculation
    let tax = 0;
    let bracket = "0%";
    
    if (taxableIncome <= 10000) {
      tax = taxableIncome * 0.10;
      bracket = "10%";
    } else if (taxableIncome <= 40000) {
      tax = 1000 + (taxableIncome - 10000) * 0.12;
      bracket = "12%";
    } else if (taxableIncome <= 85000) {
      tax = 4600 + (taxableIncome - 40000) * 0.22;
      bracket = "22%";
    } else if (taxableIncome <= 160000) {
      tax = 14500 + (taxableIncome - 85000) * 0.24;
      bracket = "24%";
    } else {
      tax = 32500 + (taxableIncome - 160000) * 0.32;
      bracket = "32%";
    }
    
    return { tax, bracket, taxableIncome };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const income = parseFloat(formData.total_income);
    const deductions = parseFloat(formData.total_deductions);
    const { tax, bracket } = calculateTax(income, deductions);

    const taxData = {
      user_id: user.id,
      year: formData.year,
      total_income: income,
      total_deductions: deductions,
      estimated_tax: tax,
      tax_bracket: bracket,
      notes: formData.notes,
    };

    if (estimate) {
      const { error } = await supabase
        .from("tax_estimates")
        .update(taxData)
        .eq("id", estimate.id);
      
      if (error) {
        toast.error("Failed to update tax estimate");
      } else {
        toast.success("Tax estimate updated");
        loadTaxEstimate();
      }
    } else {
      const { error } = await supabase
        .from("tax_estimates")
        .insert(taxData);
      
      if (error) {
        toast.error("Failed to create tax estimate");
      } else {
        toast.success("Tax estimate created");
        loadTaxEstimate();
      }
    }
  };

  const { tax, bracket, taxableIncome } = formData.total_income && formData.total_deductions
    ? calculateTax(parseFloat(formData.total_income), parseFloat(formData.total_deductions))
    : { tax: 0, bracket: "0%", taxableIncome: 0 };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Tax Estimate</h1>
          <p className="text-muted-foreground">Calculate your estimated tax liability</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Tax Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="year">Tax Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="total_income">Total Income</Label>
                  <Input
                    id="total_income"
                    type="number"
                    step="0.01"
                    value={formData.total_income}
                    onChange={(e) => setFormData({ ...formData, total_income: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="total_deductions">Total Deductions</Label>
                  <Input
                    id="total_deductions"
                    type="number"
                    step="0.01"
                    value={formData.total_deductions}
                    onChange={(e) => setFormData({ ...formData, total_deductions: e.target.value })}
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
                <Button type="submit" className="w-full">
                  {estimate ? "Update Estimate" : "Calculate Tax"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Estimated Tax</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Taxable Income</p>
                    <p className="text-2xl font-bold">${taxableIncome.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tax Bracket</p>
                    <p className="text-2xl font-bold">{bracket}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Tax</p>
                    <p className="text-3xl font-bold text-primary">${tax.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tax Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This is a simplified tax calculation. Actual tax liability may vary based on your specific situation,
                  credits, and additional factors. Consult a tax professional for accurate advice.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}