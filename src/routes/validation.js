import { checkSchema, validationResult } from "express-validator";

const schema = {
  title: {
    in: ["body"],
    isString: {
      errorMessage: "title validation failed , type must be string  ",
    },
  },
  category: {
    in: ["body"],
    isString: {
      errorMessage: "category validation failed , type must be  string ",
    },
  },
  cover: {
    in: ["body"],
    isString: {
      errorMessage: "cover validation failed , type must be string",
    },
  },
};

const searchSchema = {
  title: {
    in: ["query"],
    isString: {
      errorMessage:
        "title must be in query and type must be string to search!",
    },
  },
};

/* const commentSchema = {
  text: {
    isString: {
      errorMessage: "Text field is required for comment",
    },
  },
  userName: {
    isString: {
      errorMessage: "User name is required for comment",
    },
  },
};
 */
/* export const checkCommentSchema = checkSchema(commentSchema);
 */
export const checkSearchSchema = checkSchema(searchSchema);

export const checkMoviePostSchema = checkSchema(schema);

export const checkValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Movie validation is failed");
    error.status = 400;
    error.errors = errors.array();
    next(error);
  }
  next();
};
