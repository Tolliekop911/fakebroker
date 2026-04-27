import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BrokerSignupForm from "@/components/broker/BrokerSignupForm";
import bullImage from "@/assets/hero-bull.webp";

const BrokerSignup = () => {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/dashboard", { replace: true });
      } else {
        setCheckingAuth(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate("/dashboard", { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-broker-primary text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
        <img 
          src={bullImage} 
          alt="Kubera Markets Bull" 
          className="w-[600px] max-w-none object-contain"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 md:p-6">
        <div className="text-center mb-6">
          <Link to="/" className="inline-block">
            <h1 className="text-2xl md:text-3xl font-heading font-bold">
              <span className="text-foreground">KUBERA</span>{" "}
              <span className="text-broker-primary">MARKETS</span>
            </h1>
          </Link>
          <p className="text-muted-foreground mt-2">CFD Trading Portal</p>
        </div>

        <BrokerSignupForm />

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-broker-primary hover:underline">
              Login here
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BrokerSignup;
