const steps = [
  {
    number: "1",
    title: "Register",
    description: "Choose an account type and submit your application",
  },
  {
    number: "2",
    title: "Fund",
    description: "Fund your account using a wide range of funding methods.",
  },
  {
    number: "3",
    title: "Trade",
    description: "Access 150+ instruments across all asset classes on our platform",
  },
];

const BrokerSteps = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl lg:text-4xl font-heading font-bold text-center text-foreground mb-12">
          Fast account opening in{" "}
          <span className="text-broker-primary">3 simple steps</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <div key={i} className="text-center">
              <div className="w-16 h-16 rounded-full bg-broker-primary text-broker-primary-foreground text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                {step.number}
              </div>
              <h3 className="text-xl font-heading font-bold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrokerSteps;
