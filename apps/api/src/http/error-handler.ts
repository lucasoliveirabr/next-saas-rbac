import type { FastifyInstance } from "fastify";
import { BadRequestError } from "./routes/_errors/bad-request-error";
import { UnauthorizedError } from "./routes/_errors/unauthorized-error";
import { hasZodFastifySchemaValidationErrors } from "fastify-type-provider-zod";

type FastifyErrorHandler = FastifyInstance["errorHandler"];

export const errorHandler: FastifyErrorHandler = (error, _request, reply) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(400).send({
      message: "Validation error.",
      errors: error.validation[0],
    });
  }

  if (error instanceof BadRequestError) {
    return reply.status(400).send({
      message: "Validation error.",
      errors: error.message,
    });
  }

  if (error instanceof UnauthorizedError) {
    return reply.status(400).send({
      message: "Validation error.",
      errors: error.message,
    });
  }

  console.error(error);

  // send error to some observability platform

  return reply.status(500).send({ message: "Internal server error." });
};
