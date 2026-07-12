/**
 * Static preview of the GST invoice PDF the platform generates on every
 * sale — numbering per claim_invoice_number() (INV-YYYY-NNNNN), HSN codes,
 * CGST/SGST breakup (see lib/invoicing.ts).
 */
export default function InvoiceMockup() {
  return (
    <div className="mock-invoice" aria-hidden="true">
      <div className="mock-invoice-head">
        <div>
          <h4>TAX INVOICE</h4>
          <div className="mock-invoice-meta">Sharma General Store</div>
          <div className="mock-invoice-meta">GSTIN 27ABCDE1234F1Z5</div>
        </div>
        <div className="mock-invoice-meta">
          <div><strong>INV-2026-00047</strong></div>
          <div>12 Jul 2026</div>
        </div>
      </div>
      <table className="mock-invoice-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>HSN</th>
            <th>Qty</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Basmati Rice 5kg</td>
            <td>1006</td>
            <td>2</td>
            <td>₹1,180</td>
          </tr>
          <tr>
            <td>Sunflower Oil 1L</td>
            <td>1512</td>
            <td>3</td>
            <td>₹472</td>
          </tr>
        </tbody>
      </table>
      <div className="mock-invoice-totals">
        <div><span>Taxable value</span><span>₹1,400</span></div>
        <div><span>CGST @ 9%</span><span>₹126</span></div>
        <div><span>SGST @ 9%</span><span>₹126</span></div>
        <div className="grand"><span>Total</span><span>₹1,652</span></div>
      </div>
      <div className="mock-invoice-foot">
        <span>PDF generated &amp; emailed automatically</span>
        <span className="mock-stamp">PAID</span>
      </div>
    </div>
  )
}
