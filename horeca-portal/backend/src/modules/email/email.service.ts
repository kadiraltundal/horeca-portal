import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private readonly fromEmail: string;

  constructor(private configService: ConfigService) {
    this.fromEmail = this.configService.get('EMAIL_FROM', 'noreply@horeca.uz');

    const smtpHost = this.configService.get('SMTP_HOST');
    const smtpPort = this.configService.get<number>('SMTP_PORT', 587);
    const smtpUser = this.configService.get('SMTP_USER');
    const smtpPass = this.configService.get('SMTP_PASS');

    if (smtpHost && smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      this.logger.log('Email transporter configured successfully');
    } else {
      this.logger.warn('SMTP not configured, emails will be logged only');
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (!this.transporter) {
        this.logger.log(`[EMAIL MOCK] To: ${options.to}, Subject: ${options.subject}`);
        return true;
      }

      await this.transporter.sendMail({
        from: this.fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      this.logger.log(`Email sent successfully to ${options.to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error);
      return false;
    }
  }

  async sendQuoteNotification(userEmail: string, quoteNumber: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .footer { background: #333; color: white; padding: 10px; text-align: center; border-radius: 0 0 5px 5px; }
          .quote-number { font-size: 24px; font-weight: bold; color: #4CAF50; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Teklif Bildirimi</h1>
          </div>
          <div class="content">
            <p>Sayın müşterimiz,</p>
            <p><span class="quote-number">${quoteNumber}</span> numaralı teklifiniz başarıyla oluşturuldu.</p>
            <p>Detaylar için uygulamamızı ziyaret ediniz.</p>
            <p>Saygılarımızla,<br><strong>HORECA Portal Ekibi</strong></p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} HORECA Portal. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `Teklif Oluşturuldu - ${quoteNumber}`,
      html,
    });
  }

  async sendOrderConfirmation(userEmail: string, orderNumber: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .footer { background: #333; color: white; padding: 10px; text-align: center; border-radius: 0 0 5px 5px; }
          .order-number { font-size: 24px; font-weight: bold; color: #2196F3; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Sipariş Onayı</h1>
          </div>
          <div class="content">
            <p>Sayın müşterimiz,</p>
            <p><span class="order-number">${orderNumber}</span> numaralı siparişiniz alındı.</p>
            <p>Siparişiniz en kısa sürede işleme alınacaktır.</p>
            <p>Sipariş durumunu uygulamamızdan takip edebilirsiniz.</p>
            <p>Saygılarımızla,<br><strong>HORECA Portal Ekibi</strong></p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} HORECA Portal. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `Sipariş Onayı - ${orderNumber}`,
      html,
    });
  }

  async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #FF9800; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .footer { background: #333; color: white; padding: 10px; text-align: center; border-radius: 0 0 5px 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Hoş Geldiniz!</h1>
          </div>
          <div class="content">
            <p>Sayın ${userName},</p>
            <p><strong>HORECA Portal</strong>'a hoş geldiniz!</p>
            <p>Uygulamamızı kullanarak:</p>
            <ul>
              <li>Binlerce ürünü keşfedebilirsiniz</li>
              <li>Kampanya ve indirimlerden haberdar olabilirsiniz</li>
              <li>Kolayca teklif oluşturabilirsiniz</li>
              <li>Siparişlerinizi takip edebilirsiniz</li>
            </ul>
            <p>Herhangi bir sorunuz olursa bize ulaşmaktan çekinmeyin.</p>
            <p>Saygılarımızla,<br><strong>HORECA Portal Ekibi</strong></p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} HORECA Portal. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: 'Hoş Geldiniz - HORECA Portal',
      html,
    });
  }

  async sendOrderStatusUpdate(userEmail: string, orderNumber: string, status: string): Promise<boolean> {
    const statusLabels: Record<string, string> = {
      confirmed: 'Onaylandı',
      processing: 'Hazırlanıyor',
      shipped: 'Kargoya Verildi',
      delivered: 'Teslim Edildi',
      cancelled: 'İptal Edildi',
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #9C27B0; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .footer { background: #333; color: white; padding: 10px; text-align: center; border-radius: 0 0 5px 5px; }
          .status { font-size: 20px; font-weight: bold; color: #9C27B0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Sipariş Durumu Güncellendi</h1>
          </div>
          <div class="content">
            <p>Sayın müşterimiz,</p>
            <p><strong>${orderNumber}</strong> numaralı siparişinizin durumu güncellendi.</p>
            <p>Yeni durum: <span class="status">${statusLabels[status] || status}</span></p>
            <p>Saygılarımızla,<br><strong>HORECA Portal Ekibi</strong></p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} HORECA Portal. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `Sipariş Durumu - ${orderNumber}`,
      html,
    });
  }

  async sendQuoteStatusUpdate(userEmail: string, quoteNumber: string, status: string): Promise<boolean> {
    const statusLabels: Record<string, string> = {
      pending: 'Beklemede',
      approved: 'Onaylandı',
      rejected: 'Reddedildi',
      expired: 'Süresi Doldu',
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #E91E63; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .footer { background: #333; color: white; padding: 10px; text-align: center; border-radius: 0 0 5px 5px; }
          .status { font-size: 20px; font-weight: bold; color: #E91E63; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Teklif Durumu Güncellendi</h1>
          </div>
          <div class="content">
            <p>Sayın müşterimiz,</p>
            <p><strong>${quoteNumber}</strong> numaralı teklifinizin durumu güncellendi.</p>
            <p>Yeni durum: <span class="status">${statusLabels[status] || status}</span></p>
            <p>Saygılarımızla,<br><strong>HORECA Portal Ekibi</strong></p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} HORECA Portal. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `Teklif Durumu - ${quoteNumber}`,
      html,
    });
  }
}
