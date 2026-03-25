export const emailTemplates = {
  verification: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Verify Your Email</h1>
      <p>Hello {{username}},</p>
      <p>Please click the button below to verify your email address:</p>
      <a href="{{verificationLink}}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
        Verify Email
      </a>
      <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
      <p>{{verificationLink}}</p>
      <p>This link will expire in 24 hours.</p>
    </div>
  `,

  welcome: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Welcome to MR Engineers!</h1>
      <p>Hi {{username}},</p>
      <p>We're excited to have you on board. Here are some things you can do to get started:</p>
      <ul>
        <li>Complete your profile</li>
        <li>Explore learning paths</li>
        <li>Join study groups</li>
        <li>Take on coding challenges</li>
      </ul>
      <p>If you have any questions, feel free to reach out to our support team.</p>
    </div>
  `,

  notification: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>{{title}}</h1>
      <p>Hello {{username}},</p>
      <p>{{message}}</p>
      {{#if link}}
      <a href="{{link}}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
        View Details
      </a>
      {{/if}}
    </div>
  `,
};
