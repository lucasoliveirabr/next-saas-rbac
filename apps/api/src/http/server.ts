import fastifyCors from "@fastify/cors";
import fastify from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { createAccount } from "./routes/auth/create-account";
import scalarFastify from "@scalar/fastify-api-reference";
import fastifySwagger from "@fastify/swagger";
import { authenticateWithPassword } from "./routes/auth/authenticate-with-password";
import fastifyJwt from "@fastify/jwt";
import { getProfile } from "./routes/auth/get-profile";
import { errorHandler } from "./error-handler";
import { requestPasswordRecover } from "./routes/auth/request-password-recover";
import { resetPassword } from "./routes/auth/reset-password";
import { authenticateWithGithub } from "./routes/auth/authenticate-with-github";
import { env } from "@saas/env";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.setErrorHandler(errorHandler);

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Next SaaS",
      description: "Full-Stack SaaS app with multi-tenant & RBAC.",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        apiKey: {
          type: "apiKey",
          name: "Authorization",
          in: "header",
        },
      },
    },
  },
  transform: jsonSchemaTransform,
});

app.register(scalarFastify, {
  routePrefix: "/docs",
});

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
});

app.register(fastifyCors);

app.register(createAccount);
app.register(authenticateWithPassword);
app.register(getProfile);
app.register(requestPasswordRecover);
app.register(resetPassword);
app.register(authenticateWithGithub);

app.listen({ port: env.SERVER_PORT }).then(() => {
  console.log("HTTP server running!");
});
