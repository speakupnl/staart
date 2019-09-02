import { ErrorCode } from "../interfaces/enum";
import { HTTPError } from "../interfaces/general";
import Joi from "@hapi/joi";

/**
 * Parse default errors and send a safe string
 */
export const safeError = (error: string) => {
  let errorString = error.toString();
  if (errorString.startsWith("Error: "))
    errorString = errorString.replace("Error: ", "");
  if (errorString.startsWith("joi:")) {
    const joiError = JSON.parse(
      errorString.split("joi:")[1]
    ) as Joi.ValidationError;
    return sendError(`422/${joiError.details[0].message}`);
  }
  if (errorString === "TokenExpiredError: jwt expired")
    return sendError(ErrorCode.EXPIRED_TOKEN);
  if (
    errorString.includes("JsonWebTokenError") ||
    errorString.includes("JsonWebTokenjwt")
  )
    return sendError(ErrorCode.INVALID_TOKEN);
  return sendError(errorString);
};

/**
 * Send an HTTPError object
 */
export const sendError = (error: string) => {
  if (error.includes("/")) {
    let status = parseInt(error.split("/")[0]);
    if (isNaN(status)) status = 500;
    let code = error.split("/")[1];
    let message;
    if (code.includes("__MESSAGE__")) {
      const data = code.split("__MESSAGE__");
      code = data[0];
      try {
        message = Buffer.from(data[1], "base64").toString();
      } catch (error) {}
    }
    if (message && message.includes("__SAFE__"))
      message = message.replace("__SAFE__", "");
    return { status, code, message } as HTTPError;
  }
  console.log("Backup error", error);
  return { status: 500, code: error } as HTTPError;
};
