type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail(input: SendEmailInput): Promise<{ ok: boolean; skipped?: boolean }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim() || "Süpervizyon <noreply@supervizyon.com>";

  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.log("[email:skipped]", { to: input.to, subject: input.subject });
    }
    return { ok: true, skipped: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[email] Resend error:", res.status, text);
    return { ok: false };
  }

  return { ok: true };
}

export function supervisorInviteLinkEmailHtml(opts: {
  inviteUrl: string;
  expiresAt: string;
}): string {
  return `
    <p>Merhaba,</p>
    <p>Süpervizör kayıt formunuz hazır. Aşağıdaki bağlantıdan profilinizi tamamlayın.</p>
    <p><strong>Geçerlilik:</strong> ${opts.expiresAt} tarihine kadar (1 hafta)</p>
    <p><a href="${opts.inviteUrl}">Kayıt formunu aç</a></p>
    <p>Bağlantı: ${opts.inviteUrl}</p>
    <p>Süpervizyon Platformu</p>
  `;
}

export function supervisorCredentialsEmailHtml(opts: {
  fullName: string;
  email: string;
  password: string;
  loginUrl: string;
}): string {
  return `
    <p>Merhaba ${opts.fullName},</p>
    <p>Süpervizör kaydınız tamamlandı. Giriş bilgileriniz:</p>
    <p><strong>E-posta:</strong> ${opts.email}<br/>
    <strong>Şifre:</strong> ${opts.password}</p>
    <p><a href="${opts.loginUrl}">Panele giriş yap</a></p>
    <p>Güvenliğiniz için giriş yaptıktan sonra profil sayfanızdan şifrenizi değiştirebilirsiniz.</p>
    <p>Süpervizyon Platformu</p>
  `;
}

export function supervisorApplicationReceivedEmailHtml(opts: {
  fullName: string;
}): string {
  return `
    <p>Merhaba ${opts.fullName},</p>
    <p>Süpervizör olma talebiniz alındı. İnceleme sonrası kayıt formu bağlantısı e-posta adresinize iletilecektir.</p>
    <p>Süpervizyon Platformu</p>
  `;
}

export function appointmentConfirmedEmailHtml(opts: {
  recipientName: string;
  supervisorName: string;
  date: string;
  startTime: string;
  endTime: string;
  meetLink?: string;
}): string {
  return `
    <p>Merhaba ${opts.recipientName},</p>
    <p><strong>${opts.supervisorName}</strong> ile randevunuz onaylandı.</p>
    <p><strong>Tarih:</strong> ${opts.date}<br/>
    <strong>Saat:</strong> ${opts.startTime} – ${opts.endTime}</p>
    ${
      opts.meetLink
        ? `<p><a href="${opts.meetLink}">Google Meet bağlantısı</a></p>`
        : ""
    }
    <p>İyi çalışmalar,<br/>Süpervizyon Platformu</p>
  `;
}
