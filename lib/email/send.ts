import { sendEmail } from "./brevo";
import {
  contactMessageEmail,
  newOrderAdminEmail,
  newVendorApplicationAdminEmail,
  orderConfirmationEmail,
  orderStatusUpdateEmail,
  vendorApplicationReceivedEmail,
  vendorApprovedEmail,
  vendorRejectedEmail,
  vendorSaleEmail,
  type OrderEmailItem,
} from "./templates";

const CONTACT_EMAIL = "stpnetosabores@gmail.com";

export async function sendOrderConfirmationEmail(params: {
  customerName: string;
  customerEmail: string;
  orderId: string;
  items: OrderEmailItem[];
  total: number;
  siteUrl: string;
}) {
  const { subject, html } = orderConfirmationEmail(params);
  await sendEmail({
    to: [{ email: params.customerEmail, name: params.customerName }],
    subject,
    html,
  });
}

export async function sendOrderStatusUpdateEmail(params: {
  customerName: string;
  customerEmail: string;
  orderId: string;
  status: string;
  siteUrl: string;
}) {
  const { subject, html } = orderStatusUpdateEmail(params);
  await sendEmail({
    to: [{ email: params.customerEmail, name: params.customerName }],
    subject,
    html,
  });
}

export async function sendNewOrderAdminEmail(params: {
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
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const { subject, html } = newOrderAdminEmail(params);
  await sendEmail({ to: [{ email: adminEmail }], subject, html });
}

export async function sendNewVendorApplicationAdminEmail(params: {
  vendorName: string;
  vendorEmail: string;
  vendorPhone: string;
  nif?: string | null;
  documentUrl?: string | null;
  siteUrl: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const { subject, html } = newVendorApplicationAdminEmail(params);
  await sendEmail({ to: [{ email: adminEmail }], subject, html });
}

export async function sendVendorSaleEmail(params: {
  vendorName: string;
  vendorEmail: string;
  orderId: string;
  items: OrderEmailItem[];
  vendorAmount: number;
  siteUrl: string;
}) {
  const { subject, html } = vendorSaleEmail(params);
  await sendEmail({ to: [{ email: params.vendorEmail, name: params.vendorName }], subject, html });
}

export async function sendVendorApplicationReceivedEmail(params: {
  vendorName: string;
  vendorEmail: string;
  siteUrl: string;
}) {
  const { subject, html } = vendorApplicationReceivedEmail(params);
  await sendEmail({ to: [{ email: params.vendorEmail, name: params.vendorName }], subject, html });
}

export async function sendVendorApprovedEmail(params: {
  vendorName: string;
  vendorEmail: string;
  siteUrl: string;
}) {
  const { subject, html } = vendorApprovedEmail(params);
  await sendEmail({ to: [{ email: params.vendorEmail, name: params.vendorName }], subject, html });
}

export async function sendVendorRejectedEmail(params: {
  vendorName: string;
  vendorEmail: string;
  siteUrl: string;
}) {
  const { subject, html } = vendorRejectedEmail(params);
  await sendEmail({ to: [{ email: params.vendorEmail, name: params.vendorName }], subject, html });
}

export async function sendContactMessageEmail(params: {
  name: string;
  email: string;
  message: string;
}) {
  const { subject, html } = contactMessageEmail(params);
  await sendEmail({
    to: [{ email: CONTACT_EMAIL }],
    subject,
    html,
    replyTo: { email: params.email, name: params.name },
  });
}
