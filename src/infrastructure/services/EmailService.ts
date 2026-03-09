import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 1025),
  secure: process.env.SMTP_SECURE === 'true',
  auth:
    process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
})

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const resetUrl = `${process.env.NEXTAUTH_URL}/esqueci-senha/${token}`

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? 'Precifica <noreply@precifica.com.br>',
    to,
    subject: 'Redefinição de senha — Precifica',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #111;">Redefinição de senha</h2>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Precifica</strong>.</p>
        <p>Clique no botão abaixo para criar uma nova senha. O link é válido por <strong>1 hora</strong>.</p>
        <a href="${resetUrl}"
           style="display:inline-block;margin:16px 0;padding:12px 24px;background:#111;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">
          Redefinir senha
        </a>
        <p style="color:#666;font-size:13px;">
          Se você não solicitou isso, ignore este email. Sua senha permanece a mesma.
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
        <p style="color:#999;font-size:12px;">
          Ou copie e cole este link no navegador:<br/>
          <a href="${resetUrl}" style="color:#666;">${resetUrl}</a>
        </p>
      </div>
    `,
  })
}
