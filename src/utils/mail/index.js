import sgMail from "@sendgrid/mail";
import { MoviePostMailTemplate } from "./moviePost";

const { SENDGRID_API_KEY, SENGRID_EMAIL } = process.env;

sgMail.setApiKey(SENDGRID_API_KEY);

const defaultParams = {
  from: SENGRID_EMAIL,
};

export const sendMoviePostMail = async ({ to, title, link }) => {
  try {
    const msg = {
      ...defaultParams,
      to,
      subject: "This is a movie.",
      html: MoviePostMailTemplate({ title, link }),
    };
    console.log(msg);
    const sengridResponse = await sgMail.send(msg);
    console.log(sengridResponse);
  } catch (error) {
    console.error(error);
    if (error.response) {
      console.error(error.response.body);
    }
  }
};
