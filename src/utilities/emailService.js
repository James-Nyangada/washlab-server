// emailService.js
const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send booking confirmation to customer
async function sendBookingConfirmation(to, booking) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 24px; border-radius: 8px;">
      <h2 style="color: #4f46e5;">Booking Confirmation ✅</h2>
      <p>Hello ${booking.fullName},</p>
      <p>Thank you for booking <strong>${booking.selectedPackage}</strong> with us!</p>
      <p>We’ve received your booking and will contact you shortly.</p>
      <p><strong>Booking Details:</strong></p>
      <ul>
        <li><strong>Name:</strong> ${booking.fullName}</li>
        <li><strong>Email:</strong> ${booking.email}</li>
        <li><strong>Phone:</strong> ${booking.phone}</li>
        <li><strong>Package:</strong> ${booking.selectedPackage}</li>
        <li><strong>Travel Dates:</strong> ${new Date(booking.travelStartDate).toLocaleDateString()} to ${new Date(booking.travelEndDate).toLocaleDateString()}</li>
      </ul>
      <p style="margin-top: 20px;">We look forward to hosting you!</p>
      <p style="font-size: 12px; color: #666;">If you have any questions, reply to this email.</p>
    </div>
  `

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Booking Confirmation - " + booking.selectedPackage,
    html,
  })
}

// Send booking notification to company
async function sendBookingNotification(to, booking) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 24px; border-radius: 8px;">
      <h2 style="color: #e11d48;">📩 New Booking Received</h2>
      <p>A new booking has been made:</p>
      <ul>
        <li><strong>Name:</strong> ${booking.fullName}</li>
        <li><strong>Email:</strong> ${booking.email}</li>
        <li><strong>Phone:</strong> ${booking.phone}</li>
        <li><strong>Package:</strong> ${booking.selectedPackage}</li>
        <li><strong>Travel Dates:</strong> ${new Date(booking.travelStartDate).toLocaleDateString()} to ${new Date(booking.travelEndDate).toLocaleDateString()}</li>
        <li><strong>Adults:</strong> ${booking.numberOfAdults}</li>
        <li><strong>Children:</strong> ${booking.numberOfChildren}</li>
        <li><strong>Booking ID:</strong> ${booking.bookingId}</li>
        ${booking.specialRequests ? `<li><strong>Special Requests:</strong> ${booking.specialRequests}</li>` : ''}
      </ul>
    </div>
  `

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "New Booking - " + booking.selectedPackage,
    html,
  })
}

module.exports = { sendBookingConfirmation, sendBookingNotification }
