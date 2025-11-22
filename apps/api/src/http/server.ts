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

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Next SaaS",
      description: "Full-Stack SaaS app with multi-tenant & RBAC.",
      version: "1.0.0",
    },
  },
  transform: jsonSchemaTransform,
});

app.register(scalarFastify, {
  routePrefix: "/docs",
});

app.register(fastifyCors);

app.register(createAccount);

app.listen({ port: 3333 }).then(() => {
  console.log("HTTP server running!");
});
