import { useState, useMemo } from "react";
import "../styles/app.pricing.css";

export default function PricingPage() {
  // Billing cycle state
  const [isAnnual, setIsAnnual] = useState(false);

  // FAQ Accordion state
  const [activeFaq, setActiveFaq] = useState(null);

  // Calculator inputs state (in USD)
  const [monthlyOrders, setMonthlyOrders] = useState(750); // Default to Growth tier
  const [aov, setAov] = useState(50); // In USD
  const [codShare, setCodShare] = useState(60);

  // Gating Logic: Determine active highlighted plan based on slider
  const activeTier = useMemo(() => {
    if (monthlyOrders <= 500) return "starter";
    if (monthlyOrders <= 1000) return "growth";
    if (monthlyOrders <= 2000) return "pro";
    return "plus";
  }, [monthlyOrders]);

  // Plus Plan Dynamic Price Calculation (in USD)
  const plusPricing = useMemo(() => {
    let rate = 0.030; // $0.030 per order for 2000-5000
    if (monthlyOrders >= 5000) {
      rate = 0.025;   // $0.025 for 5000-10000
    }
    if (monthlyOrders >= 10000) {
      rate = 0.020;   // $0.020 for 10000+
    }

    const basePrice = monthlyOrders * rate;
    // Billed annually discount of 20%
    const monthlyFee = isAnnual ? Math.round(basePrice * 0.8) : Math.round(basePrice);
    const displayRate = isAnnual ? (rate * 0.8).toFixed(3) : rate.toFixed(3);

    return {
      fee: monthlyFee,
      rate: displayRate,
      isDynamic: monthlyOrders > 2000
    };
  }, [monthlyOrders, isAnnual]);

  // Calculator math (in USD)
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
    
    // Average Cost of RTO per order in USD:
    // Forward + Reverse shipping & processing: $8.00
    // Packaging & operations waste: $2.00
    // Locked inventory / item depreciation: 5% of AOV
    const rtoCostPerOrder = 8 + 2 + (aov * 0.05);
    
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
    if (typeof window !== "undefined") {
      localStorage.setItem("simulated_plan", planName);
    }
    const message = `Activated the ${planName} Plan! Navigating to Dashboard...`;
    if (typeof window !== "undefined" && window.shopify) {
      window.shopify.toast.show(message, { duration: 3000 });
      setTimeout(() => {
        window.location.href = "/app";
      }, 1000);
    } else {
      alert(message);
      window.location.href = "/app";
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
            <p className="plan-desc">For small brands with <strong>0 - 500</strong> monthly orders. Basic analytics tracking.</p>
            <div className="plan-price-wrapper">
              <span className="plan-currency">$</span>
              <span className="plan-price">{isAnnual ? "4" : "5"}</span>
              <span className="plan-billing-period">/month</span>
            </div>
            <ul className="plan-features-list">
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text">Basic Order Metrics (Delivered, Failed, etc.)</span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text">Order filtering (by Date range & Products)</span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text">Top RTO States, Cities & Pincodes lists</span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text">Courier performance comparison breakdown</span>
              </li>
              <li className="plan-feature-item">
                {crossIcon}
                <span className="plan-feature-text disabled">Interactive Product-Breakdown charts</span>
              </li>
              <li className="plan-feature-item">
                {crossIcon}
                <span className="plan-feature-text disabled">Geographical RTO India Heat Map</span>
              </li>
              <li className="plan-feature-item">
                {crossIcon}
                <span className="plan-feature-text disabled">Third-party connector status view</span>
              </li>
              <li className="plan-feature-item">
                {crossIcon}
                <span className="plan-feature-text disabled">Premium PowerPoint (PPT) report export</span>
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
            <p className="plan-desc">For growing stores with <strong>500 - 1,000</strong> monthly orders. Adds deep visual insights.</p>
            <div className="plan-price-wrapper">
              <span className="plan-currency">$</span>
              <span className="plan-price">{isAnnual ? "8" : "10"}</span>
              <span className="plan-billing-period">/month</span>
            </div>
            <ul className="plan-features-list">
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text">Basic Order Metrics & Filters</span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text">Top RTO States, Cities, Pincodes & Couriers</span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text">Product-level RTO & Revenue charts</span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text"><strong>Interactive Product-Breakdown charts</strong></span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text"><strong>Geographical RTO India Heat Map</strong></span>
              </li>
              <li className="plan-feature-item">
                {crossIcon}
                <span className="plan-feature-text disabled">Third-party connector status view</span>
              </li>
              <li className="plan-feature-item">
                {crossIcon}
                <span className="plan-feature-text disabled">Premium PowerPoint (PPT) report export</span>
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
            <p className="plan-desc">For high-volume stores with <strong>1,000 - 2,000</strong> monthly orders. Exporters & connectors.</p>
            <div className="plan-price-wrapper">
              <span className="plan-currency">$</span>
              <span className="plan-price">{isAnnual ? "16" : "20"}</span>
              <span className="plan-billing-period">/month</span>
            </div>
            <ul className="plan-features-list">
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text">All Growth visualization & chart features</span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text">Product-level RTO & Revenue charts</span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text">Geographical RTO India Heat Map</span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text"><strong>Third-party connector status view</strong></span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text"><strong>Premium PowerPoint (PPT) report export</strong></span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text">Standard email & chat customer support</span>
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
            <p className="plan-desc">For enterprise brands with <strong>2,000+</strong> orders. Customizable analytics.</p>
            <div className="plan-price-wrapper">
              <span className="plan-currency">$</span>
              <span className="plan-price">
                {plusPricing.isDynamic ? plusPricing.fee.toLocaleString() : (isAnnual ? "24*" : "30*")}
              </span>
              <span className="plan-billing-period">/month</span>
            </div>
            <div className="dynamic-avg-rate">
              Avg. ${plusPricing.rate}/order request
            </div>
            <ul className="plan-features-list">
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text">All Pro level dashboard analytics features</span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text">Premium PowerPoint (PPT) report export</span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text"><strong>Custom API metric exports</strong></span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text"><strong>Custom CSS dashboard overrides</strong></span>
              </li>
              <li className="plan-feature-item">
                {checkIcon}
                <span className="plan-feature-text">Dedicated account manager & 24/7 support</span>
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
                  <span className="calculator-field-value">${aov.toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="200" 
                  step="5"
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
              <p className="results-savings">${calculatorSavings.monthlySavings.toLocaleString()}</p>
              <p className="results-subtext">
                By preventing checkouts with invalid addresses and confirming purchases, you recover blocked inventory and shipping costs.
              </p>
              
              <div className="results-breakdown">
                <div className="breakdown-row">
                  <span className="breakdown-label">Estimated RTO Cost / Order</span>
                  <span className="breakdown-value">${calculatorSavings.rtoCostPerOrder}</span>
                </div>
                <div className="breakdown-row">
                  <span className="breakdown-label">Monthly Orders Saved from RTO</span>
                  <span className="breakdown-value highlight">{calculatorSavings.ordersSaved} orders</span>
                </div>
                <div className="breakdown-row">
                  <span className="breakdown-label">Annualized Return on Investment</span>
                  <span className="breakdown-value highlight">${calculatorSavings.yearlySavings.toLocaleString()} / year</span>
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
                  <th style={{ width: "28%" }}>Feature</th>
                  <th style={{ width: "18%" }}>Starter</th>
                  <th style={{ width: "18%" }}>Growth</th>
                  <th style={{ width: "18%" }}>Pro</th>
                  <th style={{ width: "18%" }}>Plus</th>
                </tr>
              </thead>
              <tbody>
                
                {/* Category: Dashboard Analytics */}
                <tr className="feature-category-row">
                  <td colSpan="5">Dashboard Analytics</td>
                </tr>
                <tr>
                  <td>KPI Order Metrics Tracking</td>
                  <td>{checkIcon} Basic</td>
                  <td>{checkIcon} Advanced</td>
                  <td>{checkIcon} Advanced</td>
                  <td>{checkIcon} Advanced</td>
                </tr>
                <tr>
                  <td>Filters (Date & Product)</td>
                  <td>{checkIcon}</td>
                  <td>{checkIcon}</td>
                  <td>{checkIcon}</td>
                  <td>{checkIcon}</td>
                </tr>
                <tr>
                  <td>RTO Breakdown Lists</td>
                  <td>{checkIcon} States/Cities/Pincodes</td>
                  <td>{checkIcon} Full List</td>
                  <td>{checkIcon} Full List</td>
                  <td>{checkIcon} Full List</td>
                </tr>
                <tr>
                  <td>Product-level RTO & Revenue</td>
                  <td>{crossIcon}</td>
                  <td>{checkIcon}</td>
                  <td>{checkIcon}</td>
                  <td>{checkIcon}</td>
                </tr>
                <tr>
                  <td>Interactive Product Breakdown</td>
                  <td>{crossIcon}</td>
                  <td>{checkIcon}</td>
                  <td>{checkIcon}</td>
                  <td>{checkIcon}</td>
                </tr>
                <tr>
                  <td>Geographical India Heat Map</td>
                  <td>{crossIcon}</td>
                  <td>{checkIcon}</td>
                  <td>{checkIcon}</td>
                  <td>{checkIcon}</td>
                </tr>
                <tr>
                  <td>Third-Party Connector Status</td>
                  <td>{crossIcon}</td>
                  <td>{crossIcon}</td>
                  <td>{checkIcon}</td>
                  <td>{checkIcon}</td>
                </tr>

                {/* Category: Reporting & Sharing */}
                <tr className="feature-category-row">
                  <td colSpan="5">Reporting & Sharing</td>
                </tr>
                <tr>
                  <td>PowerPoint (PPT) Exporter</td>
                  <td>{crossIcon}</td>
                  <td>{crossIcon}</td>
                  <td>{checkIcon}</td>
                  <td>{checkIcon}</td>
                </tr>
                <tr>
                  <td>Custom API Metrics Export</td>
                  <td>{crossIcon}</td>
                  <td>{crossIcon}</td>
                  <td>{crossIcon}</td>
                  <td>{checkIcon}</td>
                </tr>

                {/* Category: Support & Customization */}
                <tr className="feature-category-row">
                  <td colSpan="5">Support & Customization</td>
                </tr>
                <tr>
                  <td>Support Channel SLA</td>
                  <td>Email (48h)</td>
                  <td>Chat & Email (4h)</td>
                  <td>Chat & Email (4h)</td>
                  <td>Dedicated Manager (24/7)</td>
                </tr>
                <tr>
                  <td>Custom Dashboard Theme/CSS</td>
                  <td>{crossIcon}</td>
                  <td>{crossIcon}</td>
                  <td>{crossIcon}</td>
                  <td>{checkIcon}</td>
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
                <span>What is RTO in Indian e-commerce, and how does this dashboard help reduce it?</span>
                {arrowIcon}
              </button>
              <div className="faq-answer" style={{ maxHeight: activeFaq === 0 ? "200px" : "0" }}>
                <div className="faq-answer-content">
                  RTO stands for Return to Origin. In India, up to 60-70% of e-commerce orders are Cash on Delivery (COD). Around 20% of these COD orders are returned because the customer is unavailable, rejects the package, or gave an incorrect address. This application provides real-time dashboard analytics, geographical heat maps, and detailed courier/product breakdowns to help you identify high-risk areas, choose optimal delivery partners, and implement focused RTO reduction strategies.
                </div>
              </div>
            </div>

            {/* FAQ 2 */}
            <div className={`faq-item ${activeFaq === 1 ? "open" : ""}`}>
              <button className="faq-question-btn" onClick={() => toggleFaq(1)}>
                <span>How does the PowerPoint export feature work?</span>
                {arrowIcon}
              </button>
              <div className="faq-answer" style={{ maxHeight: activeFaq === 1 ? "200px" : "0" }}>
                <div className="faq-answer-content">
                  Available on the Pro and Plus plans, the PowerPoint export utility captures your active dashboard visual components (KPI metric cards, charts, breakdowns, and heat maps) in high-resolution, formats them automatically into a professional report deck, and downloads it directly to your device for easy sharing.
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
                  No. Unlike shipping aggregators, we do not charge any transaction fees, commissions, or percentages of your order values. You pay only the flat monthly/annual fee listed above for our performance reporting software tools.
                </div>
              </div>
            </div>

            {/* FAQ 5 */}
            <div className={`faq-item ${activeFaq === 4 ? "open" : ""}`}>
              <button className="faq-question-btn" onClick={() => toggleFaq(4)}>
                <span>How frequently is the dashboard data synced with my store?</span>
                {arrowIcon}
              </button>
              <div className="faq-answer" style={{ maxHeight: activeFaq === 4 ? "200px" : "0" }}>
                <div className="faq-answer-content">
                  The dashboard syncs in real-time with your Shopify store. Whenever an order is created, fulfilled, or its delivery tracking status updates, the dashboard charts and tables immediately refresh to reflect the latest figures.
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
