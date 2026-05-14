import { buildInvoiceHtml } from "./printInvoice";

const waitForFrameLoad = (iframe) =>
  new Promise((resolve) => {
    iframe.onload = resolve;
  });

const waitForImages = async (doc) => {
  const images = Array.from(doc.images || []);

  await Promise.all(
    images.map((img) => {
      if (img.complete) return Promise.resolve();

      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    }),
  );
};

const getAssetDataUrl = async (assetPath) => {
  const response = await fetch(assetPath);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const downloadFile = (file) => {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");

  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const generateInvoicePdfFile = async (order) => {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);
  const iframe = document.createElement("iframe");
  const fileName = `invoice-${order.order_number || order.id}.pdf`;

  iframe.style.position = "fixed";
  iframe.style.left = "-10000px";
  iframe.style.top = "0";
  iframe.style.width = "1000px";
  iframe.style.height = "1400px";
  iframe.style.border = "0";
  iframe.setAttribute("aria-hidden", "true");

  document.body.appendChild(iframe);

  try {
    const logoUrl = await getAssetDataUrl("/icon.png");
    const loaded = waitForFrameLoad(iframe);
    iframe.contentDocument.open();
    iframe.contentDocument.write(
      buildInvoiceHtml(order, { autoPrint: false, logoUrl }),
    );
    iframe.contentDocument.close();
    await loaded;

    const doc = iframe.contentDocument;
    await doc.fonts?.ready;
    await waitForImages(doc);

    const invoice = doc.querySelector(".invoice-wrapper") || doc.body;
    const canvas = await html2canvas(invoice, {
      backgroundColor: "#FFFDF5",
      scale: 1.35,
      useCORS: true,
      foreignObjectRendering: true,
      windowWidth: 1000,
    });

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 6;
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = pageHeight - margin * 2;
    const imageData = canvas.toDataURL("image/jpeg", 0.92);
    let imageHeight = (canvas.height * contentWidth) / canvas.width;
    let heightLeft = imageHeight;
    let position = margin;

    if (imageHeight <= contentHeight * 1.08) {
      imageHeight = Math.min(imageHeight, contentHeight);
      pdf.addImage(imageData, "JPEG", margin, margin, contentWidth, imageHeight);
      const blob = pdf.output("blob");
      return new File([blob], fileName, { type: "application/pdf" });
    }

    pdf.addImage(imageData, "JPEG", margin, position, contentWidth, imageHeight);
    heightLeft -= contentHeight;

    while (heightLeft > 2) {
      position = margin + heightLeft - imageHeight;
      pdf.addPage();
      pdf.addImage(imageData, "JPEG", margin, position, contentWidth, imageHeight);
      heightLeft -= contentHeight;
    }

    const blob = pdf.output("blob");
    return new File([blob], fileName, { type: "application/pdf" });
  } finally {
    iframe.remove();
  }
};

export const shareOrDownloadInvoicePdf = async (order) => {
  const file = await generateInvoicePdfFile(order);

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: `Invoice ${order.order_number}`,
      text: `فاتورة طلبك رقم ${order.order_number}`,
    });

    return { shared: true, file };
  }

  downloadFile(file);
  return { shared: false, file };
};
