import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendVerificationEmail(
  to: string,
  verifyUrl: string,
): Promise<void> {
  await transporter.sendMail({
    from: `"Wordy" <${process.env.GMAIL_USER}>`,
    to,
    subject: '[Wordy] 이메일 인증을 완료해주세요',
    html: `
     <div style="background-color:#F4F5F7;padding:80px 16px;font-family:'Apple SD Gothic Neo','Malgun Gothic',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:700px;margin:0 auto;background-color:#FFFFFF;border-radius:32px;">
    <tr>
      <td style="padding:80px 100px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;margin:0 auto;">
          <tr>
            <td style="padding-bottom:12px;">
              <img src="https://wordy-be.p-e.kr/assets/logo.svg" alt="Wordy" width="80" style="display:block;" />
            </td>
          </tr>
          <tr>
            <td style="font-size:30px;font-weight:700;color:#16181D;padding-bottom:12px;">
              메일 인증 알림
            </td>
          </tr>
          <tr>
            <td style="font-size:16px;line-height:1.7;color:#6B7280;padding-bottom:40px;">
              환영합니다! 워디를 시작해볼까요?<br />
              계정을 활성화하려면 아래 버튼을 눌러 메일을 인증해 주세요
            </td>
          </tr>
          <tr>
            <td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="background-color:#5D5DF1;border-radius:16px;">
                    <a href="${verifyUrl}" style="display:block;width:100%;box-sizing:border-box;padding:18px 24px;font-size:16px;font-weight:700;color:#FFFFFF;text-decoration:none;text-align:center;">
                      메일 인증하기
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</div>
    `,
  });
}
