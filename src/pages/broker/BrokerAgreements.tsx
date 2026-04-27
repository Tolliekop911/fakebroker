import BrokerDashboardLayout from "@/components/broker/BrokerDashboardLayout";
import { FileText, Download, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const BrokerAgreements = () => {
  // These would normally come from the database
  // For now, showing empty state when no agreements exist
  const agreements: any[] = [];

  return (
    <BrokerDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Agreements</h1>
          <p className="text-muted-foreground">Review and accept legal agreements</p>
        </div>

        {agreements.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No Agreements</h3>
            <p className="text-sm text-muted-foreground">
              You don't have any agreements to review yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {agreements.map((agreement, index) => (
              <div key={index} className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-broker-primary/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-broker-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{agreement.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {agreement.version} • Last updated: {agreement.date}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`flex items-center gap-1 text-sm px-3 py-1 rounded-full ${
                      agreement.status === "Accepted" 
                        ? "bg-green-500/10 text-green-500"
                        : agreement.status === "Pending"
                        ? "bg-yellow-500/10 text-yellow-500"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {agreement.status === "Accepted" && <Check className="w-4 h-4" />}
                      {agreement.status === "Pending" && <Clock className="w-4 h-4" />}
                      {agreement.status}
                    </span>

                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="text-broker-primary">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                      {agreement.status === "Pending" && (
                        <Button size="sm" className="bg-broker-primary hover:bg-broker-primary/90 text-broker-primary-foreground">
                          Accept
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </BrokerDashboardLayout>
  );
};

export default BrokerAgreements;
