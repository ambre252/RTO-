import { useState, useMemo } from "react";
import "../styles/app.pricing.css";

export default function PricingPage() {
  // Billing cycle state
  const [isAnnual, setIsAnnual] = useState(false);

  // FAQ Accordion state
  const [activeFaq, setActiveFaq] = useState(null);

  // Calculator inputs state
  const [monthlyOrders, setMonthlyOrders] = useState(500);
  const [aov, setAov] = useState(1200);
  const [codShare, setCodShare] = useState(60);

  // Calculator math
  const calculatorSavings = useMemo(() => {
    const codOrders = monthlyOrders * (codShare / 100);
    
    // In India, standard COD RTO is ~20% without verification
    const standardRtoRate = 0.20;
    const standardRtoOrders = codOrders * standardRtoRate;
    
    // With our system, RTO drops to ~8%
    const optimizedRtoRate = 0.08;
    const optimizedRtoOrders = codOrders * optimizedRtoRate;
    
    const ordersSaved = Math.round(standardRtoOrders - optimizedRtoOrders);
    
    // Average Cost of RTO per order:
    // Forward + Reverse shipping: ₹75
    // Packaging & operations waste: ₹30
    // Locked inventory / item depreciation: 5% of AOV
    const rtoCostPerOrder = 75 + 30 + (aov * 0.05);
    
    const monthlySavings = Math.round(ordersSaved * rtoCostPerOrder);
    const yearlySavings = monthlySavings * 12;

    return {
      ordersSaved,
      monthlySavings,
      yearlySavings,
      rtoCostPerOrder: Math.round(rtoCostPerOrder)
    };
  }, [monthlyOrders, aov, codShare]);

  const handlePlanSelect = (planName) => {
    const message = `Initiated checkout flow for the ${planName} Plan (${isAnnual ? "Annual" : "Monthly"}).`;
    if (typeof window !== "undefined" && window.shopify) {
      window.shopify.toast.show(message, { duration: 3000 });
    } else {
      alert(message);
    }
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  // SVGs for Icons
  const checkIcon = (
    <svg className="plan-feature-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
    </svg>
  );

  const crossIcon = (
    <svg className="plan-feature-icon disabled" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
  );

  const arrowIcon = (
    <svg className="faq-toggle-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );

  return (
    <div className="pricing-page-wrapper">
      <div className="pricing-container">
        
        {/* Header */}
        <div className="pricing-header">
          <h1>Pricing & Plans</h1>
          <p>
            Choose the perfect plan to streamline your shipping, automate COD verifications, and reduce Return-to-Origin (RTO) overhead.
          </p>
          
          <div className="billing-toggle-wrapper">
            <button 
              className={`billing-toggle-btn ${!isAnnual ? "active" : ""}`}
              onClick={() => setIsAnnual(false)}
            >
              Monthly
            </button>
            <button 
              className={`billing-toggle-btn ${isAnnual ? "active" : ""}`}
              onClick={() => setIsAnnual(true)}
            >
              Annual
              <span className="billing-discount-badge">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="plans-grid">
          
          {/* Lite Plan */}
          <div className="plan-card">
            <h3 className="plan-type">Lite</h3>
            <p className="plan-desc">For starters testing the waters. Pay-as-you-go logistics features.</p>
            <div className="plan-price-wrapper">
              <span className="plan-currency">₹</span>
              <span className="plan-price">0</span>
              <span className="plan-billing-period">/month</span>
            </div>
            <ul className="plan-features-list">
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text">2 Basic couriers (Xpressbees, Shadowfax)</span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text">Standard rates (Domestic shipping)</span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text">Weekly COD remittance (7 days)</span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text">Manual weight dispute upload</span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text">Basic RTO risk flags</span>
              </li>
              <li className="plan-feature-item">
                {crossIcon}
                <span className="plan-feature-text disabled">WhatsApp COD order confirmations</span>
              </li>
              <li className="plan-feature-item">
                {crossIcon}
                <span className="plan-feature-text disabled">Automated IVR verification calls</span>
              </li>
              <li className="plan-feature-item">
                {crossIcon}
                <span className="plan-feature-text disabled">White-labeled customer tracking page</span>
              </li>
            </ul>
            <button className="plan-btn" onClick={() => handlePlanSelect("Lite")}>
              Get Started
            </button>
          </div>

          {/* Growth Plan */}
          <div className="plan-card recommended">
            <span className="recommended-badge">Most Popular</span>
            <h3 className="plan-type">Growth</h3>
            <p className="plan-desc">For growing stores looking to automate COD verifications and minimize RTO fees.</p>
            <div className="plan-price-wrapper">
              <span className="plan-currency">₹</span>
              <span className="plan-price">{isAnnual ? "1,199" : "1,499"}</span>
              <span className="plan-billing-period">/month</span>
            </div>
            <ul className="plan-features-list">
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text">6 Premium couriers (Blue Dart, Delhivery, etc.)</span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text">Discounted shipping rates (Up to 10% off)</span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text">Accelerated COD remittance (2-day cycle)</span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text">1-Click weight dispute manager</span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text">Advanced AI-driven RTO risk flags</span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text"><strong>Automated WhatsApp COD confirm</strong></span>
              </li>
              <li className="plan-feature-item">
                {crossIcon}
                <span className="plan-feature-text disabled">Automated IVR verification calls</span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text">Standard branded customer tracking page</span>
              </li>
            </ul>
            <button className="plan-btn" onClick={() => handlePlanSelect("Growth")}>
              Upgrade to Growth
            </button>
          </div>

          {/* VIP Plan */}
          <div className="plan-card">
            <h3 className="plan-type">VIP</h3>
            <p className="plan-desc">For high-volume brands demanding ultimate RTO protection and shipping discounts.</p>
            <div className="plan-price-wrapper">
              <span className="plan-currency">₹</span>
              <span className="plan-price">{isAnnual ? "3,999" : "4,999"}</span>
              <span className="plan-billing-period">/month</span>
            </div>
            <ul className="plan-features-list">
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text">All couriers + Priority Express Air service</span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text">Lowest shipping rates (Up to 22% off)</span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text"><strong>Next-day COD remittance (24h)</strong></span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text">Auto-file weight discrepancies via API</span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text">Custom AI predictive models for RTO</span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text">WhatsApp confirmation + address correction</span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text"><strong>Automated IVR callback confirmation</strong></span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text">Fully customizable custom-CSS tracking page</span>
              </li>
            </ul>
            <button className="plan-btn" onClick={() => handlePlanSelect("VIP")}>
              Upgrade to VIP
            </button>
          </div>

        </div>

        {/* Interactive Savings Calculator */}
        <div className="calculator-section">
          <div className="calculator-title-wrapper">
            <span className="calculator-badge">ROI Calculator</span>
            <h2>Estimate Your COD & RTO Savings</h2>
            <p className="sub">Calculate how much revenue you can recover with our automated verification suite.</p>
          </div>
          
          <div className="calculator-grid">
            <div className="calculator-inputs">
              
              {/* Field: Monthly Orders */}
              <div className="calculator-field">
                <div className="calculator-field-header">
                  <span className="calculator-field-label">Monthly Orders</span>
                  <span className="calculator-field-value">{monthlyOrders.toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="5000" 
                  step="50"
                  value={monthlyOrders}
                  onChange={(e) => setMonthlyOrders(Number(e.target.value))}
                  className="slider-input"
                />
              </div>

              {/* Field: Average Order Value */}
              <div className="calculator-field">
                <div className="calculator-field-header">
                  <span className="calculator-field-label">Average Order Value (AOV)</span>
                  <span className="calculator-field-value">₹{aov.toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min="500" 
                  max="10000" 
                  step="100"
                  value={aov}
                  onChange={(e) => setAov(Number(e.target.value))}
                  className="slider-input"
                />
              </div>

              {/* Field: COD Order Share */}
              <div className="calculator-field">
                <div className="calculator-field-header">
                  <span className="calculator-field-label">COD Share (%)</span>
                  <span className="calculator-field-value">{codShare}%</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="90" 
                  step="5"
                  value={codShare}
                  onChange={(e) => setCodShare(Number(e.target.value))}
                  className="slider-input"
                />
              </div>

            </div>

            {/* Calculator Results */}
            <div className="calculator-results">
              <p className="results-label">Estimated Monthly Savings</p>
              <p className="results-savings">₹{calculatorSavings.monthlySavings.toLocaleString()}</p>
              <p className="results-subtext">
                By preventing checkouts with invalid addresses and confirming purchases, you recover blocked inventory and shipping costs.
              </p>
              
              <div className="results-breakdown">
                <div className="breakdown-row">
                  <span className="breakdown-label">Estimated RTO Cost / Order</span>
                  <span className="breakdown-value">₹{calculatorSavings.rtoCostPerOrder}</span>
                </div>
                <div className="breakdown-row">
                  <span className="breakdown-label">Monthly Orders Saved from RTO</span>
                  <span className="breakdown-value highlight">{calculatorSavings.ordersSaved} orders</span>
                </div>
                <div className="breakdown-row">
                  <span className="breakdown-label">Annualized Return on Investment</span>
                  <span className="breakdown-value highlight">₹{calculatorSavings.yearlySavings.toLocaleString()} / year</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Comparison Table */}
        <div className="comparison-section">
          <h2>Compare Plan Features</h2>
          
          <div className="table-responsive">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th style={{ width: "34%" }}>Feature</th>
                  <th style={{ width: "22%" }}>Lite</th>
                  <th style={{ width: "22%" }}>Growth</th>
                  <th style={{ width: "22%" }}>VIP</th>
                </tr>
              </thead>
              <tbody>
                
                {/* Category: Shipping */}
                <tr className="feature-category-row">
                  <td colSpan="4">Shipping & Logistics</td>
                </tr>
                <tr>
                  <td>Courier Integrations</td>
                  <td>2 Basic</td>
                  <td>6 Premium</td>
                  <td>All partners + Express Air</td>
                </tr>
                <tr>
                  <td>Shipping Rates Discount</td>
                  <td>Standard pricing</td>
                  <td>Up to 10% off standard rates</td>
                  <td>Up to 22% off standard rates</td>
                </tr>
                <tr>
                  <td>COD Remittance Cycle</td>
                  <td>Weekly (7 Days)</td>
                  <td>Bi-weekly (2 Days)</td>
                  <td><strong>Next-day (24 Hours)</strong></td>
                </tr>

                {/* Category: RTO Prevention */}
                <tr className="feature-category-row">
                  <td colSpan="4">RTO Prevention Suite</td>
                </tr>
                <tr>
                  <td>AI RTO Risk Scoring</td>
                  <td>Basic high-risk tags</td>
                  <td>Predictive AI flags</td>
                  <td>Custom store-trained AI models</td>
                </tr>
                <tr>
                  <td>WhatsApp Verification</td>
                  <td>{crossIcon}</td>
                  <td>{checkIcon} (Automated)</td>
                  <td>{checkIcon} (Automated with address edit)</td>
                </tr>
                <tr>
                  <td>IVR Call Verification</td>
                  <td>{crossIcon}</td>
                  <td>{crossIcon}</td>
                  <td>{checkIcon} (Fallback confirmations)</td>
                </tr>
                <tr>
                  <td>Address Auto-Correction</td>
                  <td>{crossIcon}</td>
                  <td>Manual check prompts</td>
                  <td>Automated via WhatsApp/AI</td>
                </tr>

                {/* Category: Reconciliation */}
                <tr className="feature-category-row">
                  <td colSpan="4">Weight Reconciliation</td>
                </tr>
                <tr>
                  <td>Dispute Management</td>
                  <td>Manual dispute templates</td>
                  <td>1-Click dispute filings</td>
                  <td>Auto-file disputes via courier API</td>
                </tr>

                {/* Category: Support */}
                <tr className="feature-category-row">
                  <td colSpan="4">Support & Branding</td>
                </tr>
                <tr>
                  <td>Support Channels</td>
                  <td>Email (48-hour SLA)</td>
                  <td>Chat & Email (4-hour SLA)</td>
                  <td>Dedicated Manager & 24/7 Phone</td>
                </tr>
                <tr>
                  <td>Branded Tracking Page</td>
                  <td>Standard Shopify</td>
                  <td>Branded with logo/color</td>
                  <td>White-labeled + Custom HTML/CSS</td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>

        {/* FAQs */}
        <div className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            
            {/* FAQ 1 */}
            <div className={`faq-item ${activeFaq === 0 ? "open" : ""}`}>
              <button className="faq-question-btn" onClick={() => toggleFaq(0)}>
                <span>What is RTO in Indian e-commerce, and how does this plugin help reduce it?</span>
                {arrowIcon}
              </button>
              <div className="faq-answer" style={{ maxHeight: activeFaq === 0 ? "200px" : "0" }}>
                <div className="faq-answer-content">
                  RTO stands for Return to Origin. In India, up to 60-70% of e-commerce orders are Cash on Delivery (COD). Around 20% of these COD orders are returned because the customer is unavailable, rejects the package, or gave an incorrect address. This app verifies COD orders using automated WhatsApp templates and IVR calls, allowing you to cancel fake/fraudulent orders before shipping, reducing RTO by up to 60%.
                </div>
              </div>
            </div>

            {/* FAQ 2 */}
            <div className={`faq-item ${activeFaq === 1 ? "open" : ""}`}>
              <button className="faq-question-btn" onClick={() => toggleFaq(1)}>
                <span>How does the weight reconciliation dispute manager work?</span>
                {arrowIcon}
              </button>
              <div className="faq-answer" style={{ maxHeight: activeFaq === 1 ? "200px" : "0" }}>
                <div className="faq-answer-content">
                  Courier partners sometimes overcharge by miscalculating package weights. Our plugin automatically flags weight discrepancies by comparing your store's product weights against courier manifests. On the Growth plan, you get a 1-click dispute generator, while the VIP plan automatically files disputes through the courier APIs, saving you thousands of rupees every month.
                </div>
              </div>
            </div>

            {/* FAQ 3 */}
            <div className={`faq-item ${activeFaq === 2 ? "open" : ""}`}>
              <button className="faq-question-btn" onClick={() => toggleFaq(2)}>
                <span>Can I switch or cancel my plan at any time?</span>
                {arrowIcon}
              </button>
              <div className="faq-answer" style={{ maxHeight: activeFaq === 2 ? "200px" : "0" }}>
                <div className="faq-answer-content">
                  Yes, you can upgrade, downgrade, or cancel your subscription at any time. When you upgrade or downgrade, Shopify prorates the charges automatically. If you cancel, your access continues until the end of your billing cycle.
                </div>
              </div>
            </div>

            {/* FAQ 4 */}
            <div className={`faq-item ${activeFaq === 3 ? "open" : ""}`}>
              <button className="faq-question-btn" onClick={() => toggleFaq(3)}>
                <span>Are there any hidden transaction fees or commissions?</span>
                {arrowIcon}
              </button>
              <div className="faq-answer" style={{ maxHeight: activeFaq === 3 ? "200px" : "0" }}>
                <div className="faq-answer-content">
                  No, we do not charge any percentage of your shipping spend or sales revenue. You pay your courier partners directly for your shipping labels (with discounts automatically applied if you use our standard rates) and pay only the flat monthly/annual fee listed above for our software tools.
                </div>
              </div>
            </div>

            {/* FAQ 5 */}
            <div className={`faq-item ${activeFaq === 4 ? "open" : ""}`}>
              <button className="faq-question-btn" onClick={() => toggleFaq(4)}>
                <span>What is next-day COD remittance?</span>
                {arrowIcon}
              </button>
              <div className="faq-answer" style={{ maxHeight: activeFaq === 4 ? "200px" : "0" }}>
                <div className="faq-answer-content">
                  Normally, courier partners hold cash collected from COD orders for 7 to 15 days, which hurts your cash flow. With our Next-Day Payout feature (available on Growth and VIP plans), we sync with courier databases and deposit COD cash into your bank account within 24 hours of delivery.
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
