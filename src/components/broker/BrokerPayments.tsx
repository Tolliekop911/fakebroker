const paymentMethods = [
  { name: "Mastercard", color: "text-red-500" },
  { name: "VISA", color: "text-blue-700" },
  { name: "PayPal", color: "text-blue-600" },
  { name: "Skrill", color: "text-purple-500" },
  { name: "NETELLER", color: "text-green-600" },
];

const BrokerPayments = () => {
  return (
    <section className="py-10 bg-muted/10 border-t border-b border-border/20">
      <div className="container mx-auto px-6">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          <div className="flex flex-col">
            <span className="font-heading font-bold text-foreground text-lg">Funding & withdrawals</span>
            <span className="text-broker-primary text-sm">No deposit fee*</span>
          </div>
          <div className="w-px h-10 bg-border/40 hidden md:block" />
          {paymentMethods.map((method, i) => (
            <span key={i} className={`text-xl md:text-2xl font-bold ${method.color} opacity-80`}>
              {method.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrokerPayments;
