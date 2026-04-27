import { Link } from "react-router-dom";

const BrokerFooter = () => {
  return (
    <footer className="border-t border-border/20 bg-background">
      {/* Newsletter Section */}
      <div className="bg-broker-primary py-16">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-3xl lg:text-4xl font-heading font-bold text-white mb-4">
            Subscribe To Our Newsletter
          </h3>
          <p className="text-white/80 mb-8">
            Be the first to receive Kubera Markets latest updates and exclusive offers
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email address *" 
              className="bg-white text-foreground border-0 flex-1 px-4 py-3 rounded-md"
            />
            <button className="bg-[hsl(220,20%,15%)] hover:bg-[hsl(220,20%,20%)] text-white font-semibold px-8 py-3 rounded-md transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-[2fr_3fr] gap-12">
          {/* Left Section - Branding & Company Info */}
          <div>
            <h2 className="text-3xl font-heading font-bold text-foreground mb-6">
              <span className="text-foreground">KUBERA</span>{" "}
              <span className="text-broker-primary">MARKETS</span>
            </h2>
            
            {/* Social Media Icons */}
            <div className="flex gap-4 mb-8">
              <a href="#" className="w-10 h-10 bg-muted hover:bg-broker-primary/20 rounded flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-muted hover:bg-broker-primary/20 rounded flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-muted hover:bg-broker-primary/20 rounded flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-muted hover:bg-broker-primary/20 rounded flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-muted hover:bg-broker-primary/20 rounded flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-muted hover:bg-broker-primary/20 rounded flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
            </div>
            
            {/* Company Info */}
            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="text-foreground font-semibold mb-2">Kubera Capital Markets Ltd</p>
              <p>Office Suite 1307, Level 13(C), Block 4</p>
              <p>Financial Park Complex</p>
              <p>Jalan Merdeka</p>
              <p>87000 Labuan, Malaysia</p>
            </div>
          </div>
          
          {/* Right Section - Link Columns */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Important Links */}
            <div>
              <h4 className="font-heading font-bold text-broker-primary text-lg mb-4">Important Links</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link to="/" className="hover:text-broker-primary transition-colors">CFD Trading</Link></li>
                <li><Link to="/company" className="hover:text-broker-primary transition-colors">Company</Link></li>
                <li><Link to="/markets" className="hover:text-broker-primary transition-colors">Markets</Link></li>
                <li><Link to="/contact" className="hover:text-broker-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            {/* Resources */}
            <div>
              <h4 className="font-heading font-bold text-broker-primary text-lg mb-4">Resources</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link to="/login" className="hover:text-broker-primary transition-colors">Dashboard</Link></li>
                <li><Link to="/signup" className="hover:text-broker-primary transition-colors">Open CFD Account</Link></li>
                <li><Link to="/markets" className="hover:text-broker-primary transition-colors">CFD Contract Specifications</Link></li>
              </ul>
            </div>
            
            {/* Disclosures */}
            <div>
              <h4 className="font-heading font-bold text-broker-primary text-lg mb-4">Disclosures</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-broker-primary transition-colors">Terms and Conditions</a></li>
                <li><a href="/legal/anti-bribery-policy.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-broker-primary transition-colors">Anti-Bribery and Anti-Corruption</a></li>
                <li><a href="/legal/privacy-policy.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-broker-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-broker-primary transition-colors">Product Disclosure</a></li>
                <li><a href="#" className="hover:text-broker-primary transition-colors">Complaints Form</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Legal Disclaimers Section */}
        <div className="border-t border-border/20 mt-12 pt-8 space-y-6 text-xs text-muted-foreground">
          <div>
            <h5 className="font-semibold text-foreground mb-2">General Risk Disclaimer</h5>
            <p>
              Nothing in our services represents a solicitation, advice, endorsement, or offer to purchase 
              or sell financial instruments by Kubera Capital Markets Ltd., its agents, employees, contractors, or any 
              connected entities. All investments include substantial risk, and investment decisions are solely 
              the investor's obligation.
            </p>
          </div>
          
          <div>
            <h5 className="font-semibold text-foreground mb-2">Regulatory Information</h5>
            <p>
              Kubera Capital Markets Ltd. (Company No. LL17507) is regulated and authorized by the Labuan Financial Services Authority (LFSA) to conduct Labuan Money Broking Business (License Number MB/21/0086). Our business address is at Office Suite 1307, Level 13(C), Block 4, Financial Park Complex, Jalan Merdeka, 87000 Labuan, Malaysia.
            </p>
          </div>
          
          <div>
            <h5 className="font-semibold text-foreground mb-2">Business Operations</h5>
            <p>
              Kubera Capital Markets Ltd. will exclusively function as a mediator and is explicitly forbidden from acting as a principal. The client shall engage in transactions with Kubera Capital Markets Ltd. in the capacity of a mediator, facilitating the connection of counterparties based on mutually agreed terms.
            </p>
          </div>
          
          <div>
            <h5 className="font-semibold text-foreground mb-2">Risk Warning</h5>
            <p>
              Contracts for Difference ("CFDs") are complex financial products that are traded on margin. Trading 
              CFDs carries a high risk of losing money rapidly, since leverage can work both to your advantage and 
              disadvantage. As a result, CFDs may not be suitable for all investors because you may lose all your 
              invested capital. Before deciding to trade, you should consider whether you understand how CFDs work and all the 
              risks involved, by taking into account your investment objectives and level of experience, and whether 
              you can afford to take the high risk of losing your money.
            </p>
          </div>
          
          <div className="flex items-center justify-between pt-6 border-t border-border/20">
            <div className="text-2xl font-heading font-bold">
              <span className="text-foreground">KUBERA</span>{" "}
              <span className="text-broker-primary">MARKETS</span>
            </div>
            <p>Copyright Kubera Capital Markets Ltd. 2025</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default BrokerFooter;