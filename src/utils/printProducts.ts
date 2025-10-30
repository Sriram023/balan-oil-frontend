export const buildProductsHTML = (manufacturerName: string, products: any[], totals: { qty: number; sum: number }) => {
  const rows = products
    .map(
      (p) =>
        `<tr>
          <td>${p.name}</td>
          <td>${p.quantity}</td>
          <td>${p.rate.toLocaleString()}</td>
          <td>${p.total.toLocaleString()}</td>
          <td>${p.date}</td>
        </tr>`
    )
    .join("");

  return `
    <html>
      <head>
        <title>${manufacturerName} - Products</title>
        <style>
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #000; padding: 8px; text-align: left; }
        </style>
      </head>
      <body>
        <h1>${manufacturerName} - Products</h1>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Rate (₹)</th>
              <th>Total (₹)</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
            <tr>
              <td><strong>Totals</strong></td>
              <td><strong>${totals.qty}</strong></td>
              <td></td>
              <td><strong>${totals.sum.toLocaleString()}</strong></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  `;
};

export const printHTMLviaIframe = (html: string) => {
  const iframe = document.createElement("iframe");
  document.body.appendChild(iframe);
  iframe.contentWindow?.document.open();
  iframe.contentWindow?.document.write(html);
  iframe.contentWindow?.document.close();
  iframe.contentWindow?.focus();
  iframe.contentWindow?.print();
  document.body.removeChild(iframe);
};
