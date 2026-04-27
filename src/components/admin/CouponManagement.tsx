import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Ticket, Plus, Trash2, Loader2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CouponCode {
  id: string;
  code: string;
  discount_percent: number;
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

const CouponManagement = () => {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<CouponCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    discountPercent: "10",
    maxUses: "",
    validUntil: "",
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from("coupon_codes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (e) {
      console.error("Error loading coupons:", e);
    } finally {
      setLoading(false);
    }
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "KM-";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code });
  };

  const handleCreate = async () => {
    if (!formData.code || !formData.discountPercent) {
      toast({ title: "Error", description: "Code and discount are required", variant: "destructive" });
      return;
    }

    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from("coupon_codes").insert({
        code: formData.code.toUpperCase(),
        discount_percent: parseInt(formData.discountPercent),
        max_uses: formData.maxUses ? parseInt(formData.maxUses) : null,
        valid_until: formData.validUntil || null,
        created_by: user?.id,
      });

      if (error) throw error;

      toast({ title: "Coupon created", description: `Code ${formData.code} created successfully` });
      setDialogOpen(false);
      setFormData({ code: "", discountPercent: "10", maxUses: "", validUntil: "" });
      loadCoupons();
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to create coupon", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (couponId: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from("coupon_codes")
        .update({ is_active: !currentState })
        .eq("id", couponId);

      if (error) throw error;
      loadCoupons();
    } catch (e) {
      console.error("Error toggling coupon:", e);
    }
  };

  const handleDelete = async (couponId: string) => {
    try {
      const { error } = await supabase
        .from("coupon_codes")
        .delete()
        .eq("id", couponId);

      if (error) throw error;
      toast({ title: "Coupon deleted" });
      loadCoupons();
    } catch (e) {
      console.error("Error deleting coupon:", e);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold flex items-center gap-2">
            <Ticket className="w-6 h-6 text-primary" />
            Coupon Codes
          </h2>
          <p className="text-muted-foreground">Manage discount codes for challenge purchases</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Coupon Code</DialogTitle>
              <DialogDescription>
                Create a discount code for challenge purchases
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Coupon Code</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="KM-XXXXX"
                  />
                  <Button variant="outline" onClick={generateCode} type="button">
                    Generate
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Discount Percentage</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.discountPercent}
                  onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Max Uses (optional)</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                  placeholder="Unlimited"
                />
              </div>

              <div className="space-y-2">
                <Label>Valid Until (optional)</Label>
                <Input
                  type="datetime-local"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                />
              </div>

              <Button onClick={handleCreate} disabled={creating} className="w-full">
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Coupon"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Uses</TableHead>
              <TableHead>Valid Until</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No coupon codes yet
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-2 py-1 rounded font-mono">{coupon.code}</code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyCode(coupon.code)}
                      >
                        {copiedCode === coupon.code ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{coupon.discount_percent}% off</Badge>
                  </TableCell>
                  <TableCell>
                    {coupon.current_uses} / {coupon.max_uses || "∞"}
                  </TableCell>
                  <TableCell>
                    {coupon.valid_until
                      ? new Date(coupon.valid_until).toLocaleDateString()
                      : "Never"}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={coupon.is_active}
                      onCheckedChange={() => handleToggleActive(coupon.id, coupon.is_active)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(coupon.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CouponManagement;