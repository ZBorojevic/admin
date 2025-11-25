import nodemailer from 'nodemailer';
import { Lead, EmailTemplate } from '@prisma/client';

export function renderTemplate(template: EmailTemplate, lead: Lead) {
  const replacements: Record<string, string | null | undefined> = {
    firstName: lead.firstName,
    lastName: lead.lastName,
    companyName: lead.companyName,
    city: lead.city,
    service: lead.service,
  };

  const replacePlaceholders = (text: string) =>
    text.replace(/{{(\w+)}}/g, (_match, key) => {
      const value = replacements[key];
      return value !== undefined && value !== null ? String(value) : '';
    });

  return {
    subject: replacePlaceholders(template.subject),
    html: replacePlaceholders(template.bodyHtml),
  };
}

export function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}
