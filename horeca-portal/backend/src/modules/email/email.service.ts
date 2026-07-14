import { Injectable, Logger } from '@nestjs/common';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // TODO: Implement actual email sending (nodemailer, SendGrid, etc.)
      this.logger.log(`Sending email to ${options.to}: ${options.subject}`);
      this.logger.log(`Email content: ${options.html.substring(0, 100)}...`);

      // For now, just log the email
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error);
      return false;
    }
  }

  async sendQuoteNotification(userEmail: string, quoteNumber: string): Promise<boolean> {
    const html = `
      <h2>Teklif Bildirimi</h2>
      <p>Sayın müşterimiz,</p>
      <p><strong>${quoteNumber}</strong> numaralı teklifiniz başarıyla oluşturuldu.</p>
      <p>Detaylar için uygulamamızı ziyaret ediniz.</p>
      <p>Saygılarımızla,<br>HORECA Portal Ekibi</p>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `Teklif Oluşturuldu - ${quoteNumber}`,
      html,
    });
  }

  async sendOrderConfirmation(userEmail: string, orderNumber: string): Promise<boolean> {
    const html = `
      <h2>Sipariş Onayı</h2>
      <p>Sayın müşterimiz,</p>
      <p><strong>${orderNumber}</strong> numaralı siparişiniz alındı.</p>
      <p>Siparişiniz en kısa sürede işleme alınacaktır.</p>
      <p>Saygılarımızla,<br>HORECA Portal Ekibi</p>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `Sipariş Onayı - ${orderNumber}`,
      html,
    });
  }

  async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
    const html = `
      <h2>Hoş Geldiniz!</h2>
      <p>Sayın ${userName},</p>
      <p>HORECA Portal'a hoş geldiniz!</p>
      <p>Uygulamamızı kullanarak ürünleri keşfedebilir, teklifler oluşturabilir ve sipariş verebilirsiniz.</p>
      <p>Saygılarımızla,<br>HORECA Portal Ekibi</p>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: 'Hoş Geldiniz - HORECA Portal',
      html,
    });
  }
}
