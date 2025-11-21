import * as z from "zod";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

export async function createAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/users",
    {
      schema: {
        body: z.object({
          name: z.string(),
          email: z.email(),
          password: z.string().min(8),
        }),
      },
    },
    () => {
      return "User created";
    }
  );
}
