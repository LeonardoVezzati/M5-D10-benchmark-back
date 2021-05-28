import express from "express";

import fs from "fs";

import uniqid from "uniqid";

import path, { dirname } from "path";

import { fileURLToPath } from "url";
import { parseFile } from "../utils/upload/index.js";

import {
  checkMoviePostSchema,
  // checkCommentSchema,
  checkSearchSchema,
  checkValidationResult,
} from "./validation.js";
import { generateMoviePDF } from "../utils/pdf/index.js";
import { sendMoviePostMail } from "../utils/mail/index.js";

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);

const moviesFilePath = path.join(__dirname, "movies.json");

const router = express.Router();

// get all movies
router.get("/", async (req, res, next) => {
  try {
    const fileAsBuffer = fs.readFileSync(moviesFilePath);
    const fileAsString = fileAsBuffer.toString();
    const fileAsJSON = JSON.parse(fileAsString);
    res.send(fileAsJSON);
  } catch (error) {
    res.send(500).send({ message: error.message });
  }
});

router.get(
  "/search",
  checkSearchSchema,
  checkValidationResult,
  async (req, res, next) => {
    try {
      const { title } = req.query;
      const fileAsBuffer = fs.readFileSync(moviesFilePath);
      const fileAsString = fileAsBuffer.toString();
      const array = JSON.parse(fileAsString);
      const filtered = array.filter((movie) =>
        movie.title.toLowerCase().includes(title.toLowerCase())  // check title on Postman
      );
      res.send(filtered);
    } catch (error) {
      res.send(500).send({ message: error.message });
    }
  }
);

// create  movie
router.post(
  "/",
  checkMoviePostSchema,
  checkValidationResult,
  async (req, res, next) => {
    try {
      // const { author } = req.body;

      const movie = {
        id: uniqid(),
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const fileAsBuffer = fs.readFileSync(moviesFilePath);

      const fileAsString = fileAsBuffer.toString();

      const fileAsJSONArray = JSON.parse(fileAsString);

      fileAsJSONArray.push(movie);
      await sendMoviePostMail({
        // to: author.email,
        title: movie.title,
        link: `http://localhost:3000/movies/${movie.id}`, // check ID on Postman
      });
      fs.writeFileSync(moviesFilePath, JSON.stringify(fileAsJSONArray));

      res.send(movie);
    } catch (error) {
      res.send(500).send({ message: error.message });
    }
  }
);

// get single movies
router.get("/:id/pdf", async (req, res, next) => {
  try {
    const fileAsBuffer = fs.readFileSync(moviesFilePath);

    const fileAsString = fileAsBuffer.toString();

    const fileAsJSONArray = JSON.parse(fileAsString);

    const movie = fileAsJSONArray.find((movie) => movie.id === req.params.id); // check ID on Postman
    if (!movie) {
      res
        .status(404)
        .send({ message: `movie with ${req.params.id} is not found!` });
    }
    const pdfStream = await generateMoviePDF(movie);
    res.setHeader("Content-Type", "application/pdf");
    pdfStream.pipe(res);
    pdfStream.end();
  } catch (error) {
    res.send(500).send({ message: error.message });
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const fileAsBuffer = fs.readFileSync(moviesFilePath);

    const fileAsString = fileAsBuffer.toString();

    const fileAsJSONArray = JSON.parse(fileAsString);

    const movie = fileAsJSONArray.find((movie) => movie.id === req.params.id);
    if (!movie) {
      res
        .status(404)
        .send({ message: `movie with ${req.params.id} is not found!` });
    }
    res.send(movie);
  } catch (error) {
    res.send(500).send({ message: error.message });
  }
});

/* router.get("/:id/comments", async (req, res, next) => {
  try {
    const fileAsBuffer = fs.readFileSync(blogsFilePath);

    const fileAsString = fileAsBuffer.toString();

    const fileAsJSONArray = JSON.parse(fileAsString);

    const blog = fileAsJSONArray.find((blog) => blog.id === req.params.id);
    if (!blog) {
      res
        .status(404)
        .send({ message: `blog with ${req.params.id} is not found!` });
    }

    blog.comments = blog.comments || [];
    res.send(blog.comments);
  } catch (error) {
    res.send(500).send({ message: error.message });
  }
}); */

// delete  movie
router.delete("/:id", async (req, res, next) => {
  try {
    const fileAsBuffer = fs.readFileSync(moviesFilePath);

    const fileAsString = fileAsBuffer.toString();

    let fileAsJSONArray = JSON.parse(fileAsString);

    const movie = fileAsJSONArray.find((movie) => movie.id === req.params.id); // check ID on Postman
    if (!movie) {
      res
        .status(404)
        .send({ message: `movie with ${req.params.id} is not found!` });
    }
    fileAsJSONArray = fileAsJSONArray.filter(
      (movie) => movie.id !== req.params.id
    );
    fs.writeFileSync(moviesFilePath, JSON.stringify(fileAsJSONArray));
    res.status(204).send();
  } catch (error) {
    res.send(500).send({ message: error.message });
  }
});

//  update movie
router.put("/:id", async (req, res, next) => {
  try {
    const fileAsBuffer = fs.readFileSync(moviesFilePath);

    const fileAsString = fileAsBuffer.toString();

    let fileAsJSONArray = JSON.parse(fileAsString);

    const movieIndex = fileAsJSONArray.findIndex(
      (movie) => movie.id === req.params.id
    );
    if (!movieIndex == -1) {
      res
        .status(404)
        .send({ message: `movie with ${req.params.id} is not found!` });
    }
    const previousMovieData = fileAsJSONArray[movieIndex];
    const changedMovie = {
      ...previousMovieData,
      ...req.body,
      updatedAt: new Date(),
      id: req.params.id,
    };
    fileAsJSONArray[movieIndex] = changedMovie;

    fs.writeFileSync(moviesFilePath, JSON.stringify(fileAsJSONArray));
    res.send(changedMovie);
  } catch (error) {
    res.send(500).send({ message: error.message });
  }
});

/* router.put(
  "/:id/comment",
  checkCommentSchema,
  checkValidationResult,
  async (req, res, next) => {
    try {
      const { text, userName } = req.body;
      const comment = { id: uniqid(), text, userName, createdAt: new Date() };
      const fileAsBuffer = fs.readFileSync(blogsFilePath);

      const fileAsString = fileAsBuffer.toString();

      let fileAsJSONArray = JSON.parse(fileAsString);

      const blogIndex = fileAsJSONArray.findIndex(
        (blog) => blog.id === req.params.id
      );
      if (!blogIndex == -1) {
        res
          .status(404)
          .send({ message: `blog with ${req.params.id} is not found!` });
      }
      const previousblogData = fileAsJSONArray[blogIndex];
      previousblogData.comments = previousblogData.comments || [];
      const changedblog = {
        ...previousblogData,
        ...req.body,
        comments: [...previousblogData.comments, comment],
        updatedAt: new Date(),
        id: req.params.id,
      };
      fileAsJSONArray[blogIndex] = changedblog;

      fs.writeFileSync(blogsFilePath, JSON.stringify(fileAsJSONArray));
      res.send(changedblog);
    } catch (error) {
      console.log(error);
      res.send(500).send({ message: error.message });
    }
  }
);
 */

router.put("/:id/cover", parseFile.single("cover"), async (req, res, next) => {
  try {
    const fileAsBuffer = fs.readFileSync(moviesFilePath);

    const fileAsString = fileAsBuffer.toString();

    let fileAsJSONArray = JSON.parse(fileAsString);

    const movieIndex = fileAsJSONArray.findIndex(
      (movie) => movie.id === req.params.id 
    );
    if (!movieIndex == -1) {
      res
        .status(404)
        .send({ message: `movie with ${req.params.id} is not found!` });
    }
    const previousMovieData = fileAsJSONArray[movieIndex];
    const changedMovie = {
      ...previousMovieData,
      cover: req.file.path,
      updatedAt: new Date(),
      id: req.params.id,
    };
    fileAsJSONArray[movieIndex] = changedMovie;

    fs.writeFileSync(moviesFilePath, JSON.stringify(fileAsJSONArray));
    res.send(changedMovie);
  } catch (error) {
    console.log(error);
    res.send(500).send({ message: error.message });
  }
});

export default router;
