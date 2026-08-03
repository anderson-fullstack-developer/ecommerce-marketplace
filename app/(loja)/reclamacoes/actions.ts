"use server";

import { sendComplaintEmail } from "@/lib/email/send";
import { contactMessageSchema, type ContactMessageInput } from "@/lib/validations/contact";

export async function sendComplaint(input: ContactMessageInput) {
  const data = contactMessageSchema.parse(input);
  await sendComplaintEmail(data);
}
