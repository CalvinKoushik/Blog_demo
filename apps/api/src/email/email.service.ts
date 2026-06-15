import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private fromEmail: string;

  constructor(private configService: ConfigService) {
    const emailUser = this.configService.get<string>('EMAIL_USER');
    const emailPassword = this.configService.get<string>('EMAIL_PASSWORD');
    const emailFrom = this.configService.get<string>('EMAIL_FROM', 'noreply@studenthub.dev');

    this.fromEmail = emailFrom;

    // Use Gmail with app-specific password
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });
  }

  async sendVerificationEmail(email: string, token: string, userName: string): Promise<void> {
    const verificationUrl = `${this.configService.get<string>('FRONTEND_URL')}/auth/verify-email?token=${token}`;

    const mailOptions = {
      from: this.fromEmail,
      to: email,
      subject: '✨ Verify Your StudentHub Email',
      html: this.getVerificationEmailTemplate(userName, verificationUrl),
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendPasswordResetEmail(email: string, token: string, userName: string): Promise<void> {
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/auth/reset-password?token=${token}`;

    const mailOptions = {
      from: this.fromEmail,
      to: email,
      subject: '🔐 Reset Your StudentHub Password',
      html: this.getPasswordResetTemplate(userName, resetUrl),
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendWelcomeEmail(email: string, userName: string): Promise<void> {
    const profileUrl = `${this.configService.get<string>('FRONTEND_URL')}/onboarding/profile`;

    const mailOptions = {
      from: this.fromEmail,
      to: email,
      subject: '🎉 Welcome to StudentHub!',
      html: this.getWelcomeEmailTemplate(userName, profileUrl),
    };

    await this.transporter.sendMail(mailOptions);
  }

  private getVerificationEmailTemplate(name: string, verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; }
            .content { background: #f9fafb; padding: 30px; margin-top: 20px; border-radius: 8px; }
            .button { display: inline-block; background: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: 600; }
            .footer { text-align: center; color: #6b7280; margin-top: 30px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Verify Your Email</h1>
              <p>Welcome to StudentHub, ${name}!</p>
            </div>
            <div class="content">
              <p>Thank you for signing up on StudentHub. To get started, please verify your email address by clicking the button below:</p>
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
              <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
                If you didn't create this account, please ignore this email.
              </p>
              <p style="margin-top: 20px; color: #6b7280; font-size: 12px;">
                This link will expire in 24 hours.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} StudentHub. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getPasswordResetTemplate(name: string, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; }
            .content { background: #f9fafb; padding: 30px; margin-top: 20px; border-radius: 8px; }
            .button { display: inline-block; background: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: 600; }
            .footer { text-align: center; color: #6b7280; margin-top: 30px; font-size: 12px; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-top: 20px; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Reset Your Password</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <div class="warning">
                <p><strong>⚠️ Important:</strong> If you didn't request this, your password is safe. You can ignore this email.</p>
              </div>
              <p style="margin-top: 20px; color: #6b7280; font-size: 12px;">
                This link will expire in 1 hour.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} StudentHub. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getWelcomeEmailTemplate(name: string, profileUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; }
            .content { background: #f9fafb; padding: 30px; margin-top: 20px; border-radius: 8px; }
            .feature { background: white; padding: 15px; margin: 15px 0; border-radius: 6px; border-left: 4px solid #10B981; }
            .button { display: inline-block; background: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: 600; }
            .footer { text-align: center; color: #6b7280; margin-top: 30px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to StudentHub!</h1>
              <p>We're excited to have you here, ${name}</p>
            </div>
            <div class="content">
              <p>Your account has been verified! You're all set to start your StudentHub journey.</p>
              
              <div class="feature">
                <h3 style="margin: 0 0 10px 0; color: #10B981;">📝 Create Your Profile</h3>
                <p style="margin: 0; color: #6b7280;">Build your professional profile and showcase your skills, projects, and achievements.</p>
              </div>

              <div class="feature">
                <h3 style="margin: 0 0 10px 0; color: #10B981;">💡 Share Your Projects</h3>
                <p style="margin: 0; color: #6b7280;">Share your projects, blogs, and tutorials with the StudentHub community.</p>
              </div>

              <div class="feature">
                <h3 style="margin: 0 0 10px 0; color: #10B981;">🤝 Connect & Learn</h3>
                <p style="margin: 0; color: #6b7280;">Follow other students, discover talent, and grow your professional network.</p>
              </div>

              <a href="${profileUrl}" class="button">Complete Your Profile</a>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} StudentHub. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
