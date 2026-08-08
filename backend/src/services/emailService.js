const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
// Verify connection configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error(" SMTP Connection Error:", error.message);
  } else {
    console.log(" Email service connected and ready to send alerts.");
  }
});

/**
 * Send intrusion alert email
 * @param {string} email - Recipient email
 * @param {Object} alert - Alert object
 */
const sendAlertEmail = async (email, alert) => {
    try {

        await transporter.sendMail({

            from: `"AI Powered IDS" <${process.env.EMAIL_USER}>`,

            to: email,

            subject: `🚨 Critical Security Alert - ${alert.attackType}`,

            html: `
                <div style="font-family:Arial,sans-serif;padding:20px">

                    <h2 style="color:red">
                        🚨 Critical Intrusion Detected
                    </h2>

                    <p>
                        Your AI Powered Intrusion Detection System has detected a
                        <strong>${alert.attackType}</strong>.
                    </p>

                    <table
                        border="1"
                        cellpadding="8"
                        cellspacing="0"
                        style="border-collapse:collapse"
                    >

                        <tr>
                            <th align="left">Attack Type</th>
                            <td>${alert.attackType}</td>
                        </tr>

                        <tr>
                            <th align="left">Severity</th>
                            <td>${alert.severity}</td>
                        </tr>

                        <tr>
                            <th align="left">Source IP</th>
                            <td>${alert.sourceIP}</td>
                        </tr>

                        <tr>
                            <th align="left">Destination IP</th>
                            <td>${alert.destinationIP}</td>
                        </tr>

                        <tr>
                            <th align="left">Protocol</th>
                            <td>${alert.protocol}</td>
                        </tr>

                        <tr>
                            <th align="left">Confidence</th>
                            <td>${alert.confidence}%</td>
                        </tr>

                        <tr>
                            <th align="left">Status</th>
                            <td>${alert.status}</td>
                        </tr>

                        <tr>
                            <th align="left">Time</th>
                            <td>${new Date().toLocaleString()}</td>
                        </tr>

                    </table>

                    <br>

                    <p style="color:#555">
                        Please investigate this event immediately.
                    </p>

                    <hr>

                    <small>
                        AI Powered Intrusion Detection System
                    </small>

                </div>
            `

        });

        console.log("Alert email sent successfully.");

    } catch (err) {

        console.error(" Email Error:", err.message);

        throw err;

    }
};
/**
 * Send 6-digit OTP for email verification
 * @param {string} email - Recipient email
 * @param {string} otp - Generated OTP code
 */
const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"AI-Powered IDS Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🔑 Your Account Verification Code - AI-IDS",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #2c3e50; text-align: center;">Account Verification</h2>
          <p>Thank you for registering. Use the OTP code below to verify your email address:</p>
          <div style="background-color: #f4f6f8; text-align: center; padding: 15px; font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #2563eb; border-radius: 6px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="font-size: 13px; color: #6b7280;">This code expires in <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(` Verification OTP sent to ${email}`);
  } catch (error) {
    console.error(" Error sending OTP email:", error.message);
    throw new Error("Failed to send verification email");
  }
};

module.exports = {
  sendAlertEmail, // Existing export
  sendOTPEmail,   // New export

};