import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

let transporter: Transporter | null = null;

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error("GMAIL_USER or GMAIL_APP_PASSWORD is not set");
  }

  transporter ??= nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  return { transporter, from: `"টাকার হিসাব" <${user}>` };
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
};

export async function sendPasswordResetCode({
  to,
  name,
  code,
  minutes,
}: PasswordResetEmail) {
  const { transporter, from } = getTransporter();
  const minutesLabel = minutes.toLocaleString("bn-BD");
  const safeName = escapeHtml(name);

  await transporter.sendMail({
    from,
    to,
    subject: `পাসওয়ার্ড বদলানোর কোড: ${code}`,
    text: [
      `${name},`,
      "",
      `এই কোডটা দিয়ে নতুন পাসওয়ার্ড ঠিক করতে পারবে: ${code}`,
      `কোডটা ${minutesLabel} মিনিট কাজ করবে।`,
      "",
      "তুমি না চাইলে এই ইমেইলটা এড়িয়ে যাও। তোমার পাসওয়ার্ড যেমন ছিল তেমনই থাকবে।",
      "",
      "— টাকার হিসাব",
    ].join("\n"),
    html: `
      <div style="font-family:system-ui,sans-serif;background:#f7f4ee;padding:32px 16px;color:#2a2825">
        <div style="max-width:440px;margin:0 auto;background:#ffffff;border:1px solid #ece7dc;border-radius:20px;padding:28px">
          <p style="margin:0 0 6px;font-size:14px;color:#8b8678">টাকার হিসাব</p>
          <h1 style="margin:0 0 16px;font-size:21px">পাসওয়ার্ড বদলানোর কোড</h1>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.6">${safeName}, এই কোডটা দিয়ে নতুন পাসওয়ার্ড ঠিক করতে পারবে।</p>
          <p style="margin:0 0 20px;padding:16px;background:#eaf1e6;border-radius:14px;text-align:center;font-size:32px;font-weight:700;letter-spacing:8px;color:#3d5f39">${code}</p>
          <p style="margin:0 0 8px;font-size:14px;color:#55514a">কোডটা ${minutesLabel} মিনিট কাজ করবে।</p>
          <p style="margin:0;font-size:14px;color:#8b8678">তুমি না চাইলে এই ইমেইলটা এড়িয়ে যাও। তোমার পাসওয়ার্ড যেমন ছিল তেমনই থাকবে।</p>
        </div>
      </div>
    `,
  });
}
