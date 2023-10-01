const nodemailer=require("nodemailer");
const Mailgen = require('mailgen');
const {env}=require("../env")

const sendEmail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Express Tribute",
      link: "https://www.expresstribute.com",
      copyright: 'Copyright © 2023 Express Tribute. All rights reserved.'
    },
  });

  const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);

  const emailHtml = mailGenerator.generate(options.mailgenContent);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: env.EMAIL,
        pass: env.PASSWORD
    }
});

  const mail = {
    from: env.EMAIL,
    to: options.email, 
    subject: options.subject,
    text: emailTextual, 
    html: emailHtml,
  };

  try {
   await transporter.sendMail(mail);
  } catch (error) {
    console.log(
      "Email service failed silently. Make sure you have provided your MAILTRAP credentials in the .env file"
    );
    console.log("Error: ", error);
  }
};

const emailVerificationMailgenContent = (name, emailVerificationOTP) => {
  return {
    body: {
      name: name,
      intro: ['Welcome to Express Tribute!', 'We\'re very excited to have you on board.'],
      action: {
        instructions:
          "To verify your email please Enter the OTP \ it will expire in 2mins",
        button: {
          color: "#22BC66",
          text: emailVerificationOTP
        },
      },
      outro: ['Need help, or have questions?', 'Just reply to this email, we\'d love to help.'],  
    },
  };
};

const forgotPasswordMailgenContent = (name, forgotPasswordOTP) => {
  return {
    body: {
      name: name,
      intro: ['Welcome to Express Tribute!', 'We\'got request for reset password.'],
      action: {
        instructions:
          "To reset you password please Enter the OTP \ it will expire in 2mins",
        button: {
          color: "#22BC66",
          text: forgotPasswordOTP
        },
      },
      outro: ['Need help, or have questions?', 'Just reply to this email, we\'d love to help.'],  
    },
  };
};
 const sendEmailOnPayment=(name,planDetails,description, totalPrice) =>{
  return {
    body: {
      name: name,
      intro: ['Greeting From Express Tribute!', 'Thank You For Choosing Us'],
      table: {
        data: [
          {
            item: 'Plan',
            description: planDetails
          },
          {
            item: 'Description',
            description: description
          },
          {
            item: 'Total Price',
            description: `₹${totalPrice}`
          }
        ],
        columns: {
          customWidth: {
            item: '20%',
            description: '80%'
          },
          customAlignment: {
            item: 'left',
            description: 'right'
          }
        }
      },
      outro: ['Need help, or have questions?', 'Just reply to this email, we\'d love to help.'], 
    }
  }
}
module.exports= {
  sendEmail,
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendEmailOnPayment
};
