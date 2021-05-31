import PdfPrinter from "pdfmake";
import striptags from "striptags";
import axios from "axios";
const fonts = {
  Roboto: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique",
  },
};

const printer = new PdfPrinter(fonts);

export const generateMoviePDF = async (movie) => {
  let imagePart = {};
  if (movie.poster) {
    // check poster on Postman
    const response = await axios.get(movie.poster, {
      // check poster on Postman
      responseType: "arraybuffer",
    });
    const movieposterURLParts = movie.poster.split("/"); // check poster on Postman
    const fileName = movieposterURLParts[movieposterURLParts.length - 1];
    const [id, extension] = fileName.split(".");
    const base64 = response.data.toString("base64");
    const base64Image = `data:image/${extension};base64,${base64}`; // check image on Postman
    imagePart = { image: base64Image, width: 500, margin: [0, 0, 0, 40] };
  }
  const docDefinition = {
    content: [
      imagePart,
      { text: movie.title, fontSize: 20, bold: true, margin: [0, 0, 0, 40] }, // check title on Postman
      { text: striptags(movie.content), lineHeight: 2 }, // check content on Postman
    ],
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  return pdfDoc;
};
