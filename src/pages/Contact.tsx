import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import BrokerNavigation from "@/components/broker/BrokerNavigation";
import BrokerFooter from "@/components/broker/BrokerFooter";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const Contact = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate submission
    await new Promise(r => setTimeout(r, 1000));
    toast({ title: "Message Sent", description: "We'll get back to you shortly." });
    setForm({ name: "", email: "", subject: "", message: "" });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <BrokerNavigation />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl lg:text-5xl font-heading font-bold text-broker-primary mb-4">Contact Us</h1>
          <p className="text-muted-foreground text-lg mb-12 max-w-2xl">
            Have a question or need assistance? Fill in the form below and our team will get back to you as soon as possible.
          </p>

          <div className="grid lg:grid-cols-[1fr_400px] gap-12">
            {/* Contact Form */}
            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Full Name <span className="text-red-500">*</span></Label>
                  <Input
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="bg-secondary border-border"
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email <span className="text-red-500">*</span></Label>
                  <Input
                    required
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="bg-secondary border-border"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Subject <span className="text-red-500">*</span></Label>
                <Input
                  required
                  value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                  className="bg-secondary border-border"
                  placeholder="How can we help?"
                />
              </div>
              <div className="space-y-2">
                <Label>Message <span className="text-red-500">*</span></Label>
                <Textarea
                  required
                  rows={6}
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  className="bg-secondary border-border resize-none"
                  placeholder="Your message..."
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="bg-broker-primary hover:bg-broker-primary/90 text-broker-primary-foreground px-8"
              >
                <Send className="w-4 h-4 mr-2" />
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </form>

            {/* Contact Info */}
            <div className="space-y-8">
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-broker-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-broker-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-muted-foreground text-sm">support@kuberamarkets.com</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-broker-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-broker-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Phone</h3>
                    <p className="text-muted-foreground text-sm">+60 87-123 456</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-broker-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-broker-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Office</h3>
                    <p className="text-muted-foreground text-sm">
                      Office Suite 1307, Level 13(C), Block 4<br />
                      Financial Park Complex, Jalan Merdeka<br />
                      87000 Labuan, Malaysia
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <BrokerFooter />
    </div>
  );
};

export default Contact;
