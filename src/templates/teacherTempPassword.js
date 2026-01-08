function teacherTempPasswordTemplate({ fullName, email, tempPassword }) {
  return `
    <p>Hello <strong>${fullName}</strong>,</p>

    <p>Your teacher account has been created successfully.</p>

    <p><strong>Login Details:</strong></p>
    <ul>
      <li>Email: ${email}</li>
      <li>Temporary Password: <strong>${tempPassword}</strong></li>
    </ul>

    <p>
      For security reasons, please log in and change your password immediately.
    </p>

    <p>
      <a href="${process.env.FRONTEND_LOGIN_URL}">
        Click here to login
      </a>
    </p>

    <p>If you did not request this, please contact the school administrator.</p>

    <br />
    <p>Regards,<br/>School Admin Team</p>
  `;
}

module.exports = teacherTempPasswordTemplate;
