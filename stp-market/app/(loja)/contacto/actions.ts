"use server";

import { sendContactMessageEmail } from "@/lib/email/send";
import { contactMessageSchema, type ContactMessageInput } from "@/lib/validations/contact";

export async function sendContactMessage(input: ContactMessageInput) {
  const data = contactMessageSchema.parse(input);
  await sendContactMessageEmail(data);
}
