import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendVerificationEmail(to: string, verifyUrl: string): Promise<void> {
  await transporter.sendMail({
    from: `"Wordy" <${process.env.GMAIL_USER}>`,
    to,
    subject: '[Wordy] 이메일 인증을 완료해주세요',
    html: `
      <p>아래 버튼을 클릭해 이메일 인증을 완료해주세요. 링크는 1시간 후 만료됩니다.</p>
      <a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:6px;">
        이메일 인증하기
      </a>
      <p style="color:#888;font-size:12px;margin-top:16px;">본인이 요청하지 않았다면 이 메일을 무시하세요.</p>
    `,
  });
}