const THEME = {
  primary: "#231F20",
  secondary: "#DFBC34",
  background: "#FFFDF5",
  surface: "#FFFFFF",
  mutedSurface: "#F7F4EA",
  border: "#E8E0C8",
  text: "#231F20",
  mutedText: "#6B6670",
};

const ORDER_STATUS = {
  pending: "قيد الانتظار",
  confirmed: "تم التأكيد",
  processing: "قيد المعالجة",
  ready: "جاهز للشحن",
  shipped: "تم الشحن",
  delivered: "تم التسليم",
  cancelled: "ملغي",
};

const PAYMENT_STATUS_LABELS = {
  pending: "معلق",
  paid: "مدفوع",
  failed: "فشل",
};

const PAYMENT_METHOD_LABELS = {
  cash_on_delivery: "الدفع عند الاستلام",
  myfatoorah: "My Fatoorah",
};

const safeText = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const formatDate = (dateString) =>
  dateString
    ? new Date(dateString).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

const formatMoney = (amount) =>
  `${Number(amount || 0).toLocaleString("ar-EG")} ر.س`;

const generateItemsRows = (items = []) =>
  items
    .map(
      (item, idx) => `
        <tr>
          <td class="cell index">${idx + 1}</td>
          <td class="cell product">${safeText(item.product_name || "-")}</td>
          <td class="cell center">${safeText(item.quantity || 0)}</td>
          <td class="cell number">${formatMoney(item.price)}</td>
          <td class="cell number total-cell">${formatMoney(item.item_total)}</td>
        </tr>`,
    )
    .join("");

export const buildInvoiceHtml = (
  order,
  { autoPrint = true, logoUrl = "/icon.png" } = {},
) => {
  const createdAt = formatDate(order.created_at);
  const bodyClass = autoPrint ? "" : ' class="pdf-mode"';
  const orderStatus = ORDER_STATUS[order.status] || order.status || "-";
  const paymentStatus =
    PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status || "-";
  const paymentMethod =
    PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method || "-";
  const items = order.items || [];

  return `
  <!DOCTYPE html>
  <html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>فاتورة | ${safeText(order.order_number)}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
      * {
        box-sizing: border-box;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      body {
        margin: 0;
        padding: 18px;
        background: ${THEME.mutedSurface};
        color: ${THEME.text};
        font-family: 'Cairo', 'Tahoma', 'Arial', sans-serif;
        line-height: 1.75;
      }

      .pdf-mode {
        padding: 0;
        background: ${THEME.background};
      }

      .invoice {
        width: 900px;
        max-width: 100%;
        margin: 0 auto;
        background: ${THEME.background};
        border: 1px solid ${THEME.border};
        border-radius: 22px;
        overflow: hidden;
        box-shadow: 0 18px 50px rgba(35, 31, 32, 0.12);
      }

      .pdf-mode .invoice {
        width: 794px;
        border-radius: 0;
        border: 0;
        box-shadow: none;
      }

      .topbar {
        height: 8px;
        background: linear-gradient(90deg, ${THEME.secondary}, ${THEME.primary});
      }

      .header {
        display: flex;
        justify-content: space-between;
        gap: 36px;
        align-items: center;
        padding: 26px 32px 24px;
        background: ${THEME.primary};
        color: white;
      }

      .brand {
        display: flex;
        align-items: center;
        flex-direction: row-reverse;
        gap: 18px;
        min-width: 270px;
        text-align: right;
      }

      .logo-box {
        width: 96px;
        height: 76px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border-radius: 0;
        border: 0;
        flex: 0 0 auto;
      }

      .logo-box img {
        width: 92px;
        height: 72px;
        object-fit: contain;
      }

      .brand-name {
        font-size: 23px;
        font-weight: 800;
        margin-bottom: 4px;
        white-space: nowrap;
      }

      .brand-subtitle {
        color: rgba(255, 255, 255, 0.72);
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
      }

      .invoice-chip {
        min-width: 205px;
        padding: 16px 18px;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(223, 188, 52, 0.32);
        text-align: right;
      }

      .invoice-chip .label {
        color: rgba(255, 255, 255, 0.68);
        font-size: 12px;
        font-weight: 700;
      }

      .invoice-chip .number {
        color: ${THEME.secondary};
        font-size: 21px;
        font-weight: 900;
        letter-spacing: 0.4px;
        margin: 4px 0;
      }

      .invoice-chip .date {
        color: rgba(255, 255, 255, 0.86);
        font-size: 12px;
      }

      .badges {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 14px 30px;
        background: ${THEME.surface};
        border-bottom: 1px solid ${THEME.border};
      }

      .badge {
        display: inline-flex;
        align-items: center;
        min-height: 30px;
        padding: 6px 12px;
        border-radius: 999px;
        background: rgba(223, 188, 52, 0.14);
        color: ${THEME.primary};
        border: 1px solid rgba(223, 188, 52, 0.35);
        font-size: 12px;
        font-weight: 800;
        line-height: 1.2;
        white-space: nowrap;
      }

      .content {
        padding: 24px 30px 26px;
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
        margin-bottom: 22px;
      }

      .card {
        background: ${THEME.surface};
        border: 1px solid ${THEME.border};
        border-radius: 18px;
        padding: 18px 20px;
      }

      .card-title {
        display: flex;
        align-items: center;
        gap: 8px;
        color: ${THEME.primary};
        font-size: 13px;
        font-weight: 800;
        line-height: 1.45;
        padding-bottom: 10px;
        margin-bottom: 10px;
        border-bottom: 1px solid ${THEME.border};
      }

      .card-title::before,
      .section-title::before {
        content: "";
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: ${THEME.secondary};
        flex: 0 0 auto;
      }

      .person-name {
        font-size: 16px;
        font-weight: 800;
        margin-bottom: 8px;
        line-height: 1.55;
        color: ${THEME.text};
      }

      .detail {
        color: ${THEME.mutedText};
        font-size: 13px;
        font-weight: 600;
        margin-top: 5px;
        line-height: 1.65;
        overflow-wrap: anywhere;
      }

      .section-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }

      .section-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 15px;
        font-weight: 800;
        line-height: 1.5;
      }

      .count-pill {
        color: ${THEME.primary};
        background: ${THEME.mutedSurface};
        border: 1px solid ${THEME.border};
        padding: 5px 12px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 800;
        white-space: nowrap;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        background: ${THEME.surface};
        border: 1px solid ${THEME.border};
        border-radius: 16px;
        overflow: hidden;
      }

      th {
        background: ${THEME.primary};
        color: white;
        padding: 11px 12px;
        font-size: 12px;
        font-weight: 800;
        text-align: right;
        white-space: nowrap;
      }

      .cell {
        padding: 12px;
        border-bottom: 1px solid ${THEME.border};
        color: ${THEME.text};
        font-size: 13px;
        font-weight: 600;
        line-height: 1.6;
        vertical-align: middle;
      }

      tr:last-child .cell {
        border-bottom: 0;
      }

      .index,
      .center {
        text-align: center;
      }

      .index {
        width: 48px;
        color: ${THEME.mutedText};
      }

      .product {
        font-weight: 800;
      }

      .number {
        direction: ltr;
        text-align: left;
        white-space: nowrap;
      }

      .total-cell {
        color: ${THEME.primary};
        font-weight: 900;
      }

      .summary-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 340px;
        gap: 18px;
        align-items: start;
        margin-top: 22px;
      }

      .notes {
        min-height: 106px;
      }

      .totals {
        background: ${THEME.surface};
        border: 1px solid ${THEME.border};
        border-radius: 18px;
        padding: 16px 18px;
      }

      .total-row {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        padding: 8px 0;
        color: ${THEME.mutedText};
        font-size: 13px;
        font-weight: 700;
        border-bottom: 1px dashed ${THEME.border};
      }

      .total-row:last-child {
        border-bottom: 0;
      }

      .grand-total {
        margin-top: 4px;
        padding-top: 14px;
        color: ${THEME.primary};
        font-size: 17px;
        font-weight: 800;
      }

      .grand-total .value {
        color: ${THEME.secondary};
        font-size: 19px;
      }

      .coupon {
        display: inline-flex;
        margin-top: 12px;
        padding: 8px 12px;
        border-radius: 12px;
        background: rgba(223, 188, 52, 0.14);
        color: ${THEME.primary};
        font-size: 12px;
        font-weight: 800;
      }

      .footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
        padding: 18px 30px;
        background: ${THEME.primary};
        color: white;
        font-size: 13px;
        font-weight: 700;
      }

      .footer strong {
        color: ${THEME.secondary};
      }

      @page {
        size: A4;
        margin: 0.4cm;
      }

      @media print {
        body {
          padding: 0;
          background: ${THEME.background};
        }

        .invoice {
          width: 100%;
          border-radius: 0;
          border: 0;
          box-shadow: none;
        }
      }
    </style>
  </head>
  <body${bodyClass}>
    <main class="invoice">
      <div class="topbar"></div>

      <header class="header">
        <section class="brand">
          <div class="logo-box">
            <img src="${logoUrl}" alt="" />
          </div>
          <div>
            <div class="brand-name">Block Star</div>
            <div class="brand-subtitle">فاتورة طلب إلكترونية</div>
          </div>
        </section>

        <section class="invoice-chip">
          <div class="label">رقم الفاتورة</div>
          <div class="number">${safeText(order.order_number)}</div>
          <div class="date">${createdAt}</div>
        </section>
      </header>

      <section class="badges">
        <span class="badge">${safeText(orderStatus)}</span>
        <span class="badge">${safeText(paymentStatus)}</span>
        <span class="badge">${safeText(paymentMethod)}</span>
      </section>

      <section class="content">
        <div class="info-grid">
          <article class="card">
            <div class="card-title">بيانات الفاتورة</div>
            <div class="person-name">${safeText(order.billing?.name || "-")}</div>
            <div class="detail">${safeText(order.billing?.email || "-")}</div>
            <div class="detail">${safeText(order.billing?.phone || "-")}</div>
            ${
              order.billing?.phone2
                ? `<div class="detail">${safeText(order.billing.phone2)}</div>`
                : ""
            }
          </article>

          <article class="card">
            <div class="card-title">عنوان الشحن</div>
            <div class="person-name">${safeText(order.shipping?.full_name || "-")}</div>
            <div class="detail">${safeText(order.shipping?.city || "-")} - ${safeText(order.shipping?.area || "-")}</div>
            <div class="detail">${safeText(order.shipping?.address || "-")}</div>
            <div class="detail">${safeText(order.shipping?.phone || "-")}</div>
          </article>
        </div>

        <section>
          <div class="section-head">
            <div class="section-title">تفاصيل المنتجات</div>
            <div class="count-pill">${items.length} منتج</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>المنتج</th>
                <th>الكمية</th>
                <th>سعر الوحدة</th>
                <th>الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${generateItemsRows(items)}
            </tbody>
          </table>

          ${
            order.coupon
              ? `<div class="coupon">كود الخصم: ${safeText(order.coupon.code)} (${formatMoney(order.discount)})</div>`
              : ""
          }
        </section>

        <section class="summary-row">
          <article class="card notes">
            <div class="card-title">ملاحظات</div>
            <div class="detail">${safeText(order.notes || "لا توجد ملاحظات")}</div>
          </article>

          <article class="totals">
            <div class="total-row">
              <span>المجموع الفرعي</span>
              <span class="number">${formatMoney(order.subtotal)}</span>
            </div>
            ${
              order.coupon
                ? `<div class="total-row">
                    <span>خصم الكوبون</span>
                    <span class="number">- ${formatMoney(order.discount)}</span>
                  </div>`
                : ""
            }
            <div class="total-row">
              <span>قيمة الضريبة</span>
              <span class="number">${formatMoney(order.tax_total || 0)}</span>
            </div>
            <div class="total-row grand-total">
              <span>الإجمالي النهائي</span>
              <span class="number value">${formatMoney(order.total)}</span>
            </div>
          </article>
        </section>
      </section>

      <footer class="footer">
        <span>شكراً لتسوقكم مع <strong>Block Star</strong></span>
        <span>${createdAt}</span>
      </footer>
    </main>

    <script>
      (function() {
        ${
          autoPrint
            ? `
        window.onload = function() {
          setTimeout(() => window.print(), 500);
        };
        `
            : ""
        }
      })();
    </script>
  </body>
  </html>`;
};

export const printInvoice = (order) => {
  const html = buildInvoiceHtml(order);
  const printWindow = window.open(
    "",
    "_blank",
    "width=1000,height=800,scrollbars=yes",
  );

  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  } else {
    console.error("Failed to open print window");
  }
};
