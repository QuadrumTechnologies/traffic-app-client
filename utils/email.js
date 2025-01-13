import nodemailer from "nodemailer";

const {
  generateStudentCourseReportHTML,
  generateLecturerReportHTML,
} = require("./emailTemplates");

class Email {
  constructor(user) {
    this.to = user.email;
    this.role = user.title ? user.title : "";
    this.firstName = user.name.split(" ")[0];
    this.from = `Joel Ojerinde <${process.env.NEXT_PUBLIC_EMAIL_USERNAME}>`;
  }

  newTransport() {
    if (process.env.NEXT_PUBLIC_NODE_ENV === "production") {
      return nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.NEXT_PUBLIC_EMAIL_USERNAME,
          pass: process.env.NEXT_PUBLIC_EMAIL_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.NEXT_PUBLIC_MAILTRAP_HOST,
      port: process.env.NEXT_PUBLIC_MAILTRAP_PORT,
      auth: {
        user: process.env.NEXT_PUBLIC_MAILTRAP_USER,
        pass: process.env.NEXT_PUBLIC_MAILTRAP_PASSWORD,
      },
    });
  }

  // Send the actual email
  async send(html, subject, attachments = []) {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html: html,
      attachments: attachments,
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send("Welcome to the Attendance System Website");
  }


  
}

export default Email;
