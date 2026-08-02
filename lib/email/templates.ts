export type OrderEmailItem = {
  name: string;
  quantity: number;
  price: number;
};

const COLORS = {
  primary: "#b5622a",
  background: "#faf5ee",
  surface: "#f6efe4",
  border: "#e8ddce",
  text: "#2b1d13",
  muted: "#8a7a68",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  PAID: "Paga",
  PROCESSING: "Em preparação",
  SHIPPED: "Enviada",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelada",
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function orderReference(orderId: string) {
  return orderId.slice(-8).toUpperCase();
}

function emailShell(heading: string, bodyHtml: string) {
  return `<!doctype html>
<html lang="pt">
  <body style="margin:0;padding:0;background-color:${COLORS.background};font-family:Georgia,'Times New Roman',serif;color:${COLORS.text};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.background};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:520px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid ${COLORS.border};">
            <tr>
              <td style="background-color:${COLORS.primary};padding:24px 32px;">
                <span style="color:#ffffff;font-size:20px;font-weight:bold;">Neto STP</span>
                <span style="color:#ffffff;opacity:0.75;font-size:13px;margin-left:10px;">São Tomé e Príncipe</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 20px;font-size:22px;line-height:1.3;">${heading}</h1>
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background-color:${COLORS.background};border-top:1px solid ${COLORS.border};text-align:center;">
                <p style="margin:0;font-size:12px;color:${COLORS.muted};">Neto STP — Produtos de São Tomé e Príncipe para Portugal.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function summaryTable(items: OrderEmailItem[], total: number) {
  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 16px;font-size:14px;">${item.quantity}× ${item.name}</td>
        <td style="padding:10px 16px;font-size:14px;text-align:right;white-space:nowrap;">€${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  return `
    <table role="presentation" width="100%" style="border-collapse:collapse;background-color:${COLORS.surface};border-radius:8px;overflow:hidden;margin:20px 0;font-size:14px;">
      <tbody>
        ${rows}
        <tr>
          <td style="padding:12px 16px;font-weight:bold;border-top:1px solid ${COLORS.border};">Total</td>
          <td style="padding:12px 16px;font-weight:bold;text-align:right;border-top:1px solid ${COLORS.border};">€${total.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>`;
}

function highlightNote(prefix: string, value: string) {
  return `<p style="margin:16px 0;font-size:14px;color:${COLORS.primary};">${prefix} <strong style="color:${COLORS.text};">${value}</strong>.</p>`;
}

function ctaButton(label: string, url: string) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 12px;">
      <tr>
        <td style="background-color:${COLORS.primary};border-radius:8px;">
          <a href="${url}" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:8px;">${label}</a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 16px;font-size:12px;color:${COLORS.muted};">Se o botão não funcionar: <a href="${url}" style="color:${COLORS.primary};">${url}</a></p>`;
}

function signOff() {
  return `<p style="margin:24px 0 0;font-size:14px;">Cumprimentos,<br /><strong>Equipa Neto STP</strong></p>`;
}

export function orderConfirmationEmail(params: {
  customerName: string;
  orderId: string;
  items: OrderEmailItem[];
  total: number;
  siteUrl: string;
}) {
  const ref = orderReference(params.orderId);
  const body = `
    <p style="margin:0 0 12px;font-size:15px;">Olá <strong>${params.customerName}</strong>,</p>
    <p style="margin:0 0 12px;font-size:15px;">Obrigado pela tua compra! Recebemos o teu pagamento e a tua encomenda já está a ser preparada.</p>
    ${summaryTable(params.items, params.total)}
    ${highlightNote("Número da encomenda:", `#${ref}`)}
    <p style="margin:0 0 8px;font-size:15px;">Vamos avisar-te por email assim que a encomenda for enviada.</p>
    ${ctaButton("Ver a loja →", `${params.siteUrl}/loja`)}
    ${signOff()}
  `;
  return {
    subject: "A tua encomenda Neto STP foi confirmada",
    html: emailShell("Encomenda confirmada", body),
  };
}

export function orderStatusUpdateEmail(params: {
  customerName: string;
  orderId: string;
  status: string;
  siteUrl: string;
}) {
  const label = STATUS_LABELS[params.status] ?? params.status;
  const ref = orderReference(params.orderId);
  const body = `
    <p style="margin:0 0 12px;font-size:15px;">Olá <strong>${params.customerName}</strong>,</p>
    <p style="margin:0 0 12px;font-size:15px;">O estado da tua encomenda <strong>#${ref}</strong> foi atualizado para:</p>
    <p style="margin:16px 0;font-size:20px;font-weight:bold;color:${COLORS.primary};">${label}</p>
    ${ctaButton("Ver a loja →", `${params.siteUrl}/loja`)}
    ${signOff()}
  `;
  return {
    subject: `A tua encomenda Neto STP está: ${label}`,
    html: emailShell("Atualização da encomenda", body),
  };
}

export function newOrderAdminEmail(params: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  items: OrderEmailItem[];
  total: number;
  siteUrl: string;
}) {
  const ref = orderReference(params.orderId);
  const body = `
    <p style="margin:0 0 12px;font-size:15px;">Nova encomenda paga.</p>
    ${summaryTable(params.items, params.total)}
    ${highlightNote("Número da encomenda:", `#${ref}`)}

    <h2 style="margin:24px 0 8px;font-size:15px;">Dados para envio</h2>
    <table role="presentation" width="100%" style="font-size:14px;line-height:1.7;">
      <tr><td style="color:${COLORS.muted};width:90px;">Nome</td><td>${params.customerName}</td></tr>
      <tr><td style="color:${COLORS.muted};">Email</td><td>${params.customerEmail}</td></tr>
      <tr><td style="color:${COLORS.muted};">Telefone</td><td>${params.customerPhone || "—"}</td></tr>
      <tr><td style="color:${COLORS.muted};">Morada</td><td>${params.address || "—"}</td></tr>
      <tr><td style="color:${COLORS.muted};">Cidade</td><td>${params.city || "—"}</td></tr>
      <tr><td style="color:${COLORS.muted};">Cód. postal</td><td>${params.postalCode || "—"}</td></tr>
      <tr><td style="color:${COLORS.muted};">País</td><td>${params.country || "—"}</td></tr>
    </table>

    ${ctaButton("Ver encomenda no painel →", `${params.siteUrl}/admin/encomendas/${params.orderId}`)}
  `;
  return {
    subject: `Nova encomenda recebida — €${params.total.toFixed(2)}`,
    html: emailShell("Nova encomenda", body),
  };
}

export function vendorApplicationReceivedEmail(params: { vendorName: string; siteUrl: string }) {
  const body = `
    <p style="margin:0 0 12px;font-size:15px;">Olá <strong>${params.vendorName}</strong>,</p>
    <p style="margin:0 0 12px;font-size:15px;">Recebemos a tua candidatura para vender na Neto STP. A nossa equipa vai analisá-la e entra em contacto assim que houver uma decisão.</p>
    ${ctaButton("Ver a loja →", `${params.siteUrl}/loja`)}
    ${signOff()}
  `;
  return {
    subject: "Recebemos a tua candidatura — Neto STP",
    html: emailShell("Candidatura recebida", body),
  };
}

export function vendorApprovedEmail(params: { vendorName: string; siteUrl: string }) {
  const body = `
    <p style="margin:0 0 12px;font-size:15px;">Olá <strong>${params.vendorName}</strong>,</p>
    <p style="margin:0 0 12px;font-size:15px;">Boas notícias! A tua candidatura para vender na Neto STP foi <strong>aprovada</strong>. Já podes entrar no painel de fornecedor e começar a adicionar os teus produtos.</p>
    ${ctaButton("Entrar no painel →", `${params.siteUrl}/fornecedor/login`)}
    ${signOff()}
  `;
  return {
    subject: "A tua candidatura foi aprovada — Neto STP",
    html: emailShell("Candidatura aprovada", body),
  };
}

export function contactMessageEmail(params: { name: string; email: string; message: string }) {
  const body = `
    <p style="margin:0 0 12px;font-size:15px;">Nova mensagem recebida através do formulário de contacto.</p>
    <table role="presentation" width="100%" style="font-size:14px;line-height:1.7;margin:16px 0;">
      <tr><td style="color:${COLORS.muted};width:70px;">Nome</td><td>${escapeHtml(params.name)}</td></tr>
      <tr><td style="color:${COLORS.muted};">Email</td><td>${escapeHtml(params.email)}</td></tr>
    </table>
    <p style="margin:16px 0 4px;font-size:13px;color:${COLORS.muted};">Mensagem</p>
    <p style="margin:0;white-space:pre-line;font-size:15px;">${escapeHtml(params.message)}</p>
  `;
  return {
    subject: `Nova mensagem de contacto — ${escapeHtml(params.name)}`,
    html: emailShell("Mensagem de contacto", body),
  };
}

export function vendorRejectedEmail(params: { vendorName: string; siteUrl: string }) {
  const body = `
    <p style="margin:0 0 12px;font-size:15px;">Olá <strong>${params.vendorName}</strong>,</p>
    <p style="margin:0 0 12px;font-size:15px;">Obrigado pelo teu interesse em vender na Neto STP. Depois de analisar a tua candidatura, não vamos avançar neste momento.</p>
    ${signOff()}
  `;
  return {
    subject: "A tua candidatura — Neto STP",
    html: emailShell("Candidatura não aprovada", body),
  };
}
