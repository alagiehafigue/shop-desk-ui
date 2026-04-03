function formatCurrency(value) {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
  }).format(Number(value ?? 0));
}

function formatDateTime(value) {
  if (!value) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-GH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatPaystackChannel(channel) {
  if (!channel) {
    return null;
  }

  if (channel === "mobile_money") {
    return "Mobile Money";
  }

  return channel
    .split("_")
    .map((value) => value.charAt(0).toUpperCase() + value.slice(1))
    .join(" ");
}

export function getPaymentDetails(paymentResult) {
  if (!paymentResult) {
    return [];
  }

  const details = [];

  if (paymentResult.method === "momo") {
    if (paymentResult.paystack_reference_id) {
      details.push({
        label: "Paystack Reference",
        value: paymentResult.paystack_reference_id,
      });
    }

    if (paymentResult.paystack_channel) {
      details.push({
        label: "Channel",
        value: formatPaystackChannel(paymentResult.paystack_channel),
      });
    }

    if (paymentResult.momo_currency) {
      details.push({
        label: "Collection Currency",
        value: paymentResult.momo_currency,
      });
    }
  }

  if (paymentResult.method === "card") {
    if (paymentResult.paystack_reference_id) {
      details.push({
        label: "Paystack Reference",
        value: paymentResult.paystack_reference_id,
      });
    }

    if (paymentResult.card_brand) {
      details.push({
        label: "Card Brand",
        value: paymentResult.card_brand,
      });
    }

    if (paymentResult.card_bank) {
      details.push({
        label: "Issuing Bank",
        value: paymentResult.card_bank,
      });
    }

    if (paymentResult.card_last4) {
      details.push({
        label: "Card",
        value: `**** ${paymentResult.card_last4}`,
      });
    }
  }

  if (paymentResult.paystack_paid_at) {
    details.push({
      label: "Paid At",
      value: formatDateTime(paymentResult.paystack_paid_at),
    });
  }

  return details;
}

export function openReceiptPrintWindow({ paymentResult, receipt }) {
  const paymentDetails = getPaymentDetails(paymentResult);
  const paymentDetailsMarkup = paymentDetails
    .map(
      (detail) => `
        <div style="display:flex;justify-content:space-between;gap:12px;margin-top:8px;">
          <span style="color:#64748b;">${detail.label}</span>
          <strong style="text-align:right;">${detail.value}</strong>
        </div>
      `,
    )
    .join("");

  const itemsMarkup = receipt.items
    .map(
      (item) => `
        <div style="display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid #e2e8f0;">
          <div>
            <div style="font-weight:700;">${item.name}</div>
            <div style="font-size:12px;color:#64748b;">${item.quantity} x ${formatCurrency(item.price)}</div>
          </div>
          <div style="font-weight:700;">${formatCurrency(item.subtotal)}</div>
        </div>
      `,
    )
    .join("");

  const printWindow = window.open("", "_blank", "width=720,height=900");

  if (!printWindow) {
    return;
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>Receipt ${receipt.transaction_id}</title>
        <style>
          body {
            font-family: "Segoe UI", sans-serif;
            margin: 0;
            padding: 32px;
            color: #0f172a;
            background: #ffffff;
          }
          .card {
            max-width: 640px;
            margin: 0 auto;
            border: 1px solid #e2e8f0;
            border-radius: 24px;
            padding: 24px;
          }
          .muted {
            color: #64748b;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.18em;
            font-weight: 700;
          }
          .title {
            font-size: 32px;
            font-weight: 800;
            margin: 8px 0 4px;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            background: #f8fafc;
            border-radius: 18px;
            padding: 16px;
            margin-top: 24px;
          }
          .totals {
            background: #f8fafc;
            border-radius: 18px;
            padding: 16px;
            margin-top: 24px;
          }
          .row {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            margin-top: 10px;
          }
          .row.total {
            border-top: 1px solid #cbd5e1;
            padding-top: 12px;
            font-size: 18px;
            font-weight: 800;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="muted">Receipt</div>
          <div class="title">${receipt.store}</div>
          <div style="color:#64748b;">Transaction ID: ${receipt.transaction_id}</div>
          <div style="color:#64748b;margin-top:6px;">${formatDateTime(receipt.date)}</div>

          <div class="grid">
            <div>
              <div class="muted">Cashier</div>
              <div style="margin-top:8px;font-weight:700;">${receipt.cashier ?? "Unknown"}</div>
            </div>
            <div>
              <div class="muted">Payment Method</div>
              <div style="margin-top:8px;font-weight:700;text-transform:uppercase;">${receipt.payment_method ?? paymentResult.method}</div>
            </div>
            <div>
              <div class="muted">Amount Paid</div>
              <div style="margin-top:8px;font-weight:700;">${formatCurrency(paymentResult.amount_paid)}</div>
            </div>
            <div>
              <div class="muted">Change</div>
              <div style="margin-top:8px;font-weight:700;">${formatCurrency(paymentResult.change)}</div>
            </div>
          </div>

          ${paymentDetails.length ? `<div class="totals"><div class="muted">Payment Details</div>${paymentDetailsMarkup}</div>` : ""}

          <div style="margin-top:24px;border:1px solid #e2e8f0;border-radius:18px;padding:16px;">
            <div class="muted">Items</div>
            <div style="margin-top:12px;">${itemsMarkup}</div>
          </div>

          <div class="totals">
            <div class="row"><span style="color:#64748b;">Discount</span><span>${formatCurrency(receipt.discount)}</span></div>
            <div class="row"><span style="color:#64748b;">Tax</span><span>${formatCurrency(receipt.tax)}</span></div>
            <div class="row total"><span>Total</span><span>${formatCurrency(receipt.total)}</span></div>
          </div>
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

export function ReceiptModal({ receipt, paymentResult, onClose }) {
  if (!receipt || !paymentResult) {
    return null;
  }

  const paymentDetails = getPaymentDetails(paymentResult);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 sm:py-8">
      <div className="max-h-full w-full max-w-2xl overflow-auto rounded-[28px] bg-white p-5 shadow-2xl sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-600">
              Payment Successful
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">{receipt.store}</h2>
            <p className="mt-2 text-sm text-slate-500">
              Transaction ID: {receipt.transaction_id}
            </p>
            <p className="mt-1 text-sm text-slate-500">{formatDateTime(receipt.date)}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              className="rounded-2xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
              type="button"
              onClick={() => openReceiptPrintWindow({ paymentResult, receipt })}
            >
              Print Receipt
            </button>
            <button
              className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
              type="button"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 rounded-[24px] bg-slate-50 p-5 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Cashier
            </p>
            <p className="mt-2 font-bold text-ink">{receipt.cashier ?? "Unknown"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Payment Method
            </p>
            <p className="mt-2 font-bold uppercase text-ink">{receipt.payment_method}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Amount Paid
            </p>
            <p className="mt-2 font-bold text-ink">{formatCurrency(paymentResult.amount_paid)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Change
            </p>
            <p className="mt-2 font-bold text-ink">{formatCurrency(paymentResult.change)}</p>
          </div>
        </div>

        {paymentDetails.length ? (
          <div className="mt-6 rounded-[24px] bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Payment Details
            </p>
            <div className="mt-3 space-y-3">
              {paymentDetails.map((detail) => (
                <div
                  key={detail.label}
                  className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <span className="text-slate-500">{detail.label}</span>
                  <span className="font-semibold text-ink">{detail.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-6 rounded-[24px] border border-slate-200">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="text-lg font-bold text-ink">Receipt Items</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {receipt.items.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-ink">{item.name}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {item.quantity} x {formatCurrency(item.price)}
                  </p>
                </div>
                <p className="font-bold text-slate-700">{formatCurrency(item.subtotal)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-3 rounded-[24px] bg-slate-50 p-5">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Discount</span>
            <span>{formatCurrency(receipt.discount)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Tax</span>
            <span>{formatCurrency(receipt.tax)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-lg font-extrabold text-ink">
            <span>Total</span>
            <span>{formatCurrency(receipt.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
