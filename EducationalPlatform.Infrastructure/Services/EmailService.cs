using EducationalPlatform.Application.DTOs.Mail;
using EducationalPlatform.Application.Interfaces.Services;
using MailKit.Net.Smtp;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Hosting;
using MimeKit;
using System.IO;
using System.Threading.Tasks;
using static QRCoder.PayloadGenerator;

namespace EducationalPlatform.Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _emailSettings;
        private readonly IWebHostEnvironment _webHostEnvironment;
        private const string BrandColor = "#4F46E5";
        private const string BrandColorLight = "#EEF2FF";
        private const string TextColor = "#374151";
        private const string MutedTextColor = "#6B7280";
        private const string BorderColor = "#E5E7EB";
        private const string WhiteColor = "#FFFFFF";
        private const string FooterBgColor = "#F3F4F6";

        public EmailService(IOptions<EmailSettings> emailSettings, IWebHostEnvironment webHostEnvironment)
        {
            _emailSettings = emailSettings.Value;
            _webHostEnvironment = webHostEnvironment;
        }

        public async Task SendWelcomeEmailAsync(string to, string userName)
        {
            var subject = "Welcome to EduPlatform!";
            var body = BuildEmailTemplate(
                headerIcon: "🎓",
                headerText: "Welcome to EduPlatform",
                bodyContent: $@"
                    <p style=""margin:0 0 16px; font-size:16px; line-height:1.6; color:{TextColor};"">
                        Dear {userName},
                    </p>
                    <p style=""margin:0 0 16px; font-size:16px; line-height:1.6; color:{TextColor};"">
                        Thank you for joining EduPlatform. We are delighted to welcome you to our learning community, where you'll have access to a curated selection of high-quality courses designed to help you grow professionally and personally.
                    </p>
                    <div style=""background:{BrandColorLight}; border-radius:8px; padding:20px; margin:24px 0;"">
                        <p style=""margin:0 0 8px; font-size:15px; font-weight:600; color:{BrandColor};"">Get Started</p>
                        <p style=""margin:0; font-size:14px; line-height:1.6; color:{TextColor};"">
                            Explore our course catalog, set your learning goals, and begin your journey today.
                        </p>
                    </div>
                    <p style=""margin:0; font-size:16px; line-height:1.6; color:{TextColor};"">
                        If you have any questions, don't hesitate to reach out to our support team.
                    </p>"
            );
            await SendEmailAsync(to, subject, body);
        }

        public async Task SendEnrollmentEmailAsync(string to, string userName, string courseName)
        {
            var subject = $"Enrollment Confirmed: {courseName}";
            var body = BuildEmailTemplate(
                headerIcon: "📘",
                headerText: "Enrollment Confirmed",
                bodyContent: $@"
                    <p style=""margin:0 0 16px; font-size:16px; line-height:1.6; color:{TextColor};"">
                        Dear {userName},
                    </p>
                    <p style=""margin:0 0 16px; font-size:16px; line-height:1.6; color:{TextColor};"">
                        This is to confirm that your enrollment in the following course has been successfully processed.
                    </p>
                    <div style=""border:1px solid {BorderColor}; border-left:4px solid {BrandColor}; border-radius:6px; padding:18px 20px; margin:24px 0; background:{WhiteColor};"">
                        <p style=""margin:0 0 6px; font-size:13px; text-transform:uppercase; letter-spacing:0.5px; color:{MutedTextColor}; font-weight:600;"">Course</p>
                        <p style=""margin:0; font-size:17px; font-weight:600; color:{TextColor};"">{courseName}</p>
                    </div>
                    <p style=""margin:0; font-size:16px; line-height:1.6; color:{TextColor};"">
                        You can access your course materials immediately from your dashboard. We wish you the best in your learning journey.
                    </p>"
            );
            await SendEmailAsync(to, subject, body);
        }

        public async Task SendCertificateEmailAsync(string to, string userName, string courseName, byte[] certificate)
        {
            var subject = $"Your Certificate for {courseName} is Here!";
            var body = BuildEmailTemplate(
                headerIcon: "🏆",
                headerText: "Congratulations on Your Achievement!",
                bodyContent: $@"
                    <p style=""margin:0 0 16px; font-size:16px; line-height:1.6; color:{TextColor};"">
                        Dear {userName},
                    </p>
                    <p style=""margin:0 0 16px; font-size:16px; line-height:1.6; color:{TextColor};"">
                        We are thrilled to congratulate you on successfully completing the <strong>{courseName}</strong> course. Your hard work and dedication have paid off.
                    </p>
                    <div style=""text-align:center; background:{BrandColorLight}; border-radius:8px; padding:28px 20px; margin:24px 0;"">
                        <p style=""margin:0 0 6px; font-size:18px; font-weight:700; color:{BrandColor};"">{courseName}</p>
                        <p style=""margin:4px 0 0; font-size:14px; color:{MutedTextColor};"">Certificate of Completion</p>
                    </div>
                    <p style=""margin:0; font-size:16px; line-height:1.6; color:{TextColor};"">
                        Your official certificate is attached to this email as a PDF. We encourage you to share your achievement with your network and on social media.
                    </p>"
            );
            await SendEmailAsync(to, subject, body, new MimePart("application", "pdf")
            {
                Content = new MimeContent(new MemoryStream(certificate)),
                FileName = $"Certificate_{courseName.Replace(" ", "_")}.pdf"
            });
        }

        public async Task SendWeeklyDigestAsync(string to, string userName, string digestContent)
        {
            var subject = "Your Weekly Digest — EduPlatform";
            var body = BuildEmailTemplate(
                headerIcon: "📰",
                headerText: "Your Weekly Digest",
                bodyContent: $@"
                    <p style=""margin:0 0 16px; font-size:16px; line-height:1.6; color:{TextColor};"">
                        Dear {userName},
                    </p>
                    <p style=""margin:0 0 16px; font-size:16px; line-height:1.6; color:{TextColor};"">
                        Here is a summary of what has been happening across EduPlatform this week.
                    </p>
                    <div style=""border:1px solid {BorderColor}; border-radius:8px; padding:20px; margin:24px 0; background:{WhiteColor};"">
                        <p style=""margin:0 0 12px; font-size:14px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; color:{BrandColor};"">This Week's Highlights</p>
                        <div style=""font-size:15px; line-height:1.7; color:{TextColor};"">
                            {digestContent}
                        </div>
                    </div>
                    <p style=""margin:0; font-size:16px; line-height:1.6; color:{TextColor};"">
                        Stay engaged and keep learning. See you next week!
                    </p>"
            );
            await SendEmailAsync(to, subject, body);
        }

        private string BuildEmailTemplate(string headerIcon, string headerText, string bodyContent)
        {
            return $@"
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset=""utf-8"">
                <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
                <title>EduPlatform</title>
                <style>
                    a {{ color: {BrandColor}; text-decoration: none; }}
                    a:hover {{ text-decoration: underline; }}
                </style>
            </head>
            <body style=""margin:0; padding:0; background:#F9FAFB; font-family:'Segoe UI', Arial, sans-serif; -webkit-font-smoothing:antialiased;"">
                <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background:#F9FAFB;"">
                    <tr>
                        <td align=""center"" style=""padding:32px 16px;"">
                            <table role=""presentation"" width=""600"" cellpadding=""0"" cellspacing=""0"" style=""max-width:600px; width:100%;"">

                                <!-- Header -->
                                <tr>
                                    <td style=""background:{WhiteColor}; border-radius:12px 12px 0 0; padding:24px 40px; text-align:center; border-bottom: 1px solid {BorderColor};"">
                                        <img src=""cid:logo"" alt=""Matter HUB Logo"" width=""150"">
                                    </td>
                                </tr>
                                <tr>
                                    <td style=""background:{BrandColor}; padding:36px 40px; text-align:center;"">
                                        <p style=""margin:0 0 12px; font-size:40px;"">{headerIcon}</p>
                                        <p style=""margin:0; font-size:24px; font-weight:700; color:{WhiteColor}; letter-spacing:-0.5px;"">{headerText}</p>
                                    </td>
                                </tr>

                                <!-- Body -->
                                <tr>
                                    <td style=""background:{WhiteColor}; padding:40px; border-left:1px solid {BorderColor}; border-right:1px solid {BorderColor};"">
                                        {bodyContent}
                                    </td>
                                </tr>

                                <!-- Divider -->
                                <tr>
                                    <td style=""background:{WhiteColor}; padding:0 40px; border-left:1px solid {BorderColor}; border-right:1px solid {BorderColor};"">
                                        <hr style=""border:none; border-top:1px solid {BorderColor}; margin:0;"">
                                    </td>
                                </tr>

                                <!-- CTA -->
                                <tr>
                                    <td style=""background:{WhiteColor}; padding:32px 40px; text-align:center; border-left:1px solid {BorderColor}; border-right:1px solid {BorderColor};"">
                                        <a href=""https://eduplatform.com/dashboard""
                                           style=""display:inline-block; background:{BrandColor}; color:{WhiteColor}; font-size:15px; font-weight:600; padding:12px 32px; border-radius:6px; text-decoration:none; letter-spacing:0.3px;"">
                                            Go to Dashboard
                                        </a>
                                    </td>
                                </tr>

                                <!-- Footer -->
                                <tr>
                                    <td style=""background:{FooterBgColor}; border-radius:0 0 12px 12px; padding:28px 40px; text-align:center; border:1px solid {BorderColor};"">
                                        <p style=""margin:0 0 6px; font-size:14px; font-weight:600; color:{TextColor};"">EduPlatform</p>
                                        <p style=""margin:0 0 12px; font-size:13px; color:{MutedTextColor}; line-height:1.5;"">
                                            Empowering learning, one course at a time.<br>
                                            © {DateTime.UtcNow.Year} EduPlatform. All rights reserved.
                                        </p>
                                        <p style=""margin:0; font-size:12px; color:{MutedTextColor};"">
                                            <a href=""https://eduplatform.com/unsubscribe"" style=""color:{MutedTextColor}; text-decoration:none;"">Unsubscribe</a>
                                            &nbsp;·&nbsp;
                                            <a href=""https://eduplatform.com/privacy"" style=""color:{MutedTextColor}; text-decoration:none;"">Privacy Policy</a>
                                            &nbsp;·&nbsp;
                                            <a href=""https://eduplatform.com/support"" style=""max-color:{MutedTextColor}; text-decoration:none;"">Support</a>
                                        </p>
                                    </td>
                                </tr>

                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>";
        }

        private async Task SendEmailAsync(string to, string subject, string body, MimePart attachment = null)
        {
            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(_emailSettings.FromName ?? "EduPlatform", _emailSettings.From ?? "no-reply@eduplatform.com"));
                message.To.Add(new MailboxAddress(to, to));
                message.Subject = subject;

                var bodyBuilder = new BodyBuilder { HtmlBody = body };

                var logoPath = Path.Combine(_webHostEnvironment.WebRootPath ?? "", "certification", "Logo", "lOGO.png");
                if (File.Exists(logoPath))
                {
                    var logoImage = bodyBuilder.LinkedResources.Add(logoPath);
                    logoImage.ContentId = "logo";
                }

                if (attachment != null)
                {
                    bodyBuilder.Attachments.Add(attachment);
                }
                message.Body = bodyBuilder.ToMessageBody();

                if (!string.IsNullOrEmpty(_emailSettings.Host))
                {
                    using (var client = new SmtpClient())
                    {
                        await client.ConnectAsync(_emailSettings.Host, _emailSettings.Port, MailKit.Security.SecureSocketOptions.StartTls);
                        await client.AuthenticateAsync(_emailSettings.Username, _emailSettings.Password);
                        await client.SendAsync(message);
                        await client.DisconnectAsync(true);
                    }
                }
            }
            catch (System.Exception ex)
            {
                System.Console.WriteLine($"[EmailService Warning] Failed to send email to {to}: {ex.Message}");
            }
        }

    }
}