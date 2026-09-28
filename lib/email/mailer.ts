import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import type { Locale } from "@/lib/i18n/config";
import { createFormat } from "@/lib/i18n/format";
import { translatorFor } from "@/lib/i18n/server";

let transporter: Transporter | null = null;

function getTransporter(appName: string) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error("GMAIL_USER or GMAIL_APP_PASSWORD is not set");
  }

  transporter ??= nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  return { transporter, from: `"${appName}" <${user}>` };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type PasswordResetEmail = {
  to: string;
  name: string;
  code: string;
  minutes: number;
  locale: Locale;
};

export async function sendPasswordResetCode({
  to,
  name,
  code,
  minutes,
  locale,
}: PasswordResetEmail) {
  const t = translatorFor(locale, "email");
  const appName = translatorFor(locale, "common")("appName");
  const { transporter, from } = getTransporter(appName);
  const expires = t("expires", { minutes: createFormat(locale).number(minutes) });
  const safeName = escapeHtml(name);

  await transporter.sendMail({
    from,
    to,
    subject: t("subject", { code }),
    text: [
      t("greeting", { name }),
      "",
      t("bodyText", { code }),
      expires,
      "",
      t("ignore"),
      "",
      `— ${appName}`,
    ].join("\n"),
    html: `
      <div lang="${locale}" style="font-family:system-ui,sans-serif;background:#f7f4ee;padding:32px 16px;color:#2a2825">
        <div style="max-width:440px;margin:0 auto;background:#ffffff;border:1px solid #ece7dc;border-radius:20px;padding:28px">
          <p style="margin:0 0 6px;font-size:14px;color:#8b8678">${appName}</p>
          <h1 style="margin:0 0 16px;font-size:21px">${t("heading")}</h1>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.6">${t("bodyHtml", { name: safeName })}</p>
          <p style="margin:0 0 20px;padding:16px;background:#eaf1e6;border-radius:14px;text-align:center;font-size:32px;font-weight:700;letter-spacing:8px;color:#3d5f39">${code}</p>
          <p style="margin:0 0 8px;font-size:14px;color:#55514a">${expires}</p>
          <p style="margin:0;font-size:14px;color:#8b8678">${t("ignore")}</p>
        </div>
      </div>
    `,
  });
}
