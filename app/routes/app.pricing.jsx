import { useState, useMemo } from "react";
import "../styles/app.pricing.css";

export default function PricingPage() {
  // Billing cycle state
  const [isAnnual, setIsAnnual] = useState(false);

  // FAQ Accordion state
  const [activeFaq, setActiveFaq] = useState(null);

  // Calculator inputs state
  const [monthlyOrders, setMonthlyOrders] = useState(750); // Default to Growth tier
  const [aov, setAov] = useState(1200);
  const [codShare, setCodShare] = useState(60);

  // Gating Logic: Determine active highlighted plan based on slider
  const activeTier = useMemo(() => {
    if (monthlyOrders <= 500) return "starter";
    if (monthlyOrders <= 1000) return "growth";
    if (monthlyOrders <= 2000) return "pro";
    return "plus";
  }, [monthlyOrders]);

  // Plus Plan Dynamic Price Calculation
  const plusPricing = useMemo(() => {
    let rate = 2.50; // default rate per order for 2000-5000
    if (monthlyOrders >= 5000) {
      rate = 2.00;   // discounted rate for 5000-10000
    }
    if (monthlyOrders >= 10000) {
      rate = 1.50;   // enterprise rate for 10000+
    }

    const basePrice = monthlyOrders * rate;
    // Billed annually discount of 20%
    const monthlyFee = isAnnual ? Math.round(basePrice * 0.8) : Math.round(basePrice);
    const displayRate = isAnnual ? (rate * 0.8).toFixed(2) : rate.toFixed(2);

    return {
      fee: monthlyFee,
      rate: displayRate,
      isDynamic: monthlyOrders > 2000
    };
  }, [monthlyOrders, isAnnual]);

  // Calculator math
  const calculatorSavings = useMemo(() => {
    const codOrders = monthlyOrders * (codShare / 100);
    
    // In India, standard RTO is ~20% without verification
    const standardRtoRate = 0.20;
    const standardRtoOrders = codOrders * standardRtoRate;
    
    // With our system, RTO drops based on tier effectiveness
    let optimizedRtoRate = 0.12; // Starter tier
    if (activeTier === "growth") optimizedRtoRate = 0.09;
    if (activeTier === "pro") optimizedRtoRate = 0.07;
    if (activeTier === "plus") optimizedRtoRate = 0.05;

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
  }, [monthlyOrders, aov, codShare, activeTier]);

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
            Choose the plan that matches your monthly order volume. Restructured to scale seamlessly as your e-commerce operations grow.
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
          
          {/* Starter Plan */}
          <div className={`plan-card ${activeTier === "starter" ? "active-highlight" : ""}`}>
            {activeTier === "starter" && <span className="recommended-badge">Active Selection</span>}
            <h3 className="plan-type">Starter</h3>
            <p className="plan-desc">For small brands with <strong>0 - 500</strong> monthly orders. Pay-as-you-go logistics.</p>
            <div className="plan-price-wrapper">
              <span className="plan-currency">₹</span>
              <span className="plan-price">{isAnnual ? "799" : "999"}</span>
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
                {checkIcon}
                <span className="plan-feature-text">WhatsApp COD confirmation (Standard)</span>
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
            <button className="plan-btn" onClick={() => handlePlanSelect("Starter")}>
              Choose Starter
            </button>
          </div>

          {/* Growth Plan */}
          <div className={`plan-card ${activeTier === "growth" ? "active-highlight" : ""}`}>
            {activeTier === "growth" && <span className="recommended-badge">Active Selection</span>}
            <h3 className="plan-type">Growth</h3>
            <p className="plan-desc">For growing stores with <strong>500 - 1,000</strong> monthly orders. Adds premium couriers.</p>
            <div className="plan-price-wrapper">
              <span className="plan-currency">₹</span>
              <span className="plan-price">{isAnnual ? "1,599" : "1,999"}</span>
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
                <span className="plan-feature-text">WhatsApp COD confirmation (Standard)</span>
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
              Choose Growth
            </button>
          </div>

          {/* Pro Plan */}
          <div className={`plan-card ${activeTier === "pro" ? "active-highlight" : ""}`}>
            {activeTier === "pro" && <span className="recommended-badge">Active Selection</span>}
            <h3 className="plan-type">Pro</h3>
            <p className="plan-desc">For high-volume stores with <strong>1,000 - 2,000</strong> monthly orders. IVR & next-day payouts.</p>
            <div className="plan-price-wrapper">
              <span className="plan-currency">₹</span>
              <span className="plan-price">{isAnnual ? "3,199" : "3,999"}</span>
              <span className="plan-billing-period">/month</span>
            </div>
            <ul className="plan-features-list">
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text">All couriers + Express Air service</span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text">Lowest shipping rates (Up to 15% off)</span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text"><strong>Next-day COD remittance (24h)</strong></span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text">1-Click weight dispute manager</span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text">Custom predictive AI models for RTO</span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text">WhatsApp confirmation + address correction</span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text"><strong>Automated IVR verification calls</strong></span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text">Standard branded customer tracking page</span>
              </li>
            </ul>
            <button className="plan-btn" onClick={() => handlePlanSelect("Pro")}>
              Choose Pro
            </button>
          </div>

          {/* Plus Plan (Dynamic 2000+) */}
          <div className={`plan-card ${activeTier === "plus" ? "active-highlight plus-dynamic-card" : ""}`}>
            {activeTier === "plus" && <span className="recommended-badge">Active Selection</span>}
            <h3 className="plan-type">Plus</h3>
            <p className="plan-desc">For enterprise brands with <strong>2,000+</strong> orders. Dynamically calculated per-order rate.</p>
            <div className="plan-price-wrapper">
              <span className="plan-currency">₹</span>
              <span className="plan-price">
                {plusPricing.isDynamic ? plusPricing.fee.toLocaleString() : (isAnnual ? "3,999*" : "4,999*")}
              </span>
              <span className="plan-billing-period">/month</span>
            </div>
            <div className="dynamic-avg-rate">
              Avg. ₹{plusPricing.rate}/order request
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
                <span className="plan-feature-text">Custom predictive AI models for RTO</span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text">WhatsApp + IVR + SMS confirmations</span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text">Custom Address Correction AI</span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text">Fully customizable custom-CSS tracking page</span>
              </li>
            </ul>
            <button className="plan-btn" onClick={() => handlePlanSelect("Plus")}>
              Contact Plus Support
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
                  max="10000" 
                  step="50"
                  value={monthlyOrders}
                  onChange={(e) => setMonthlyOrders(Number(e.target.value))}
                  className="slider-input"
                />
                <span className="slider-tier-info">
                  Active Tier: <strong style={{ textTransform: "capitalize" }}>{activeTier}</strong> ({
                    activeTier === "starter" ? "0 - 500 orders" :
                    activeTier === "growth" ? "500 - 1000 orders" :
                    activeTier === "pro" ? "1000 - 2000 orders" :
                    "2000+ orders (Dynamic Price)"
                  })
                </span>
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
                  <th style={{ width: "24%" }}>Feature</th>
                  <th style={{ width: "19%" }}>Starter</th>
                  <th style={{ width: "19%" }}>Growth</th>
                  <th style={{ width: "19%" }}>Pro</th>
                  <th style={{ width: "19%" }}>Plus</th>
                </tr>
              </thead>
              <tbody>
                
                {/* Category: Shipping */}
                <tr className="feature-category-row">
                  <td colSpan="5">Shipping & Logistics</td>
                </tr>
                <tr>
                  <td>Courier Integrations</td>
                  <td>2 Basic</td>
                  <td>6 Premium</td>
                  <td>All partners + Express Air</td>
                  <td>All partners + Priority Air</td>
                </tr>
                <tr>
                  <td>Shipping Rates Discount</td>
                  <td>Standard pricing</td>
                  <td>Up to 10% off</td>
                  <td>Up to 15% off</td>
                  <td>Up to 22% off</td>
                </tr>
                <tr>
                  <td>COD Remittance Cycle</td>
                  <td>Weekly (7 Days)</td>
                  <td>Bi-weekly (2 Days)</td>
                  <td><strong>Next-day (24h)</strong></td>
                  <td><strong>Next-day (24h)</strong></td>
                </tr>

                {/* Category: RTO Prevention */}
                <tr className="feature-category-row">
                  <td colSpan="5">RTO Prevention Suite</td>
                </tr>
                <tr>
                  <td>AI RTO Risk Scoring</td>
                  <td>Basic high-risk tags</td>
                  <td>Predictive AI flags</td>
                  <td>Custom store-trained AI</td>
                  <td>Custom store-trained AI</td>
                </tr>
                <tr>
                  <td>WhatsApp Verification</td>
                  <td>{checkIcon} (Standard)</td>
                  <td>{checkIcon} (Standard)</td>
                  <td>{checkIcon} (With address correction)</td>
                  <td>{checkIcon} (With address correction)</td>
                </tr>
                <tr>
                  <td>IVR Call Verification</td>
                  <td>{crossIcon}</td>
                  <td>{crossIcon}</td>
                  <td>{checkIcon} (Fallback confirmations)</td>
                  <td>{checkIcon} (Fallback confirmations)</td>
                </tr>
                <tr>
                  <td>Address Auto-Correction</td>
                  <td>{crossIcon}</td>
                  <td>Manual check prompts</td>
                  <td>Automated via WhatsApp/AI</td>
                  <td>Automated via WhatsApp/AI</td>
                </tr>

                {/* Category: Reconciliation */}
                <tr className="feature-category-row">
                  <td colSpan="5">Weight Reconciliation</td>
                </tr>
                <tr>
                  <td>Dispute Management</td>
                  <td>Manual dispute templates</td>
                  <td>1-Click dispute filings</td>
                  <td>1-Click dispute filings</td>
                  <td>Auto-file disputes via courier API</td>
                </tr>

                {/* Category: Support */}
                <tr className="feature-category-row">
                  <td colSpan="5">Support & Branding</td>
                </tr>
                <tr>
                  <td>Support Channels</td>
                  <td>Email (48-hour SLA)</td>
                  <td>Chat & Email (4-hour SLA)</td>
                  <td>Chat & Email (4-hour SLA)</td>
                  <td>Dedicated Manager & 24/7 Phone</td>
                </tr>
                <tr>
                  <td>Branded Tracking Page</td>
                  <td>Standard Shopify</td>
                  <td>Branded with logo/color</td>
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
