import * as z from "zod";
import bcrypt from "bcryptjs";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "@/lib/prisma";

export async function createAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/users",
    {
      schema: {
        tags: ["Auth"],
        summary: "Create a new account",
        body: z.object({
          name: z.string(),
          email: z.email(),
          password: z.string().min(8),
        }),
      },
    },
    async (request, reply) => {
      const { name, email, password } = request.body;

      const userWithSameEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (userWithSameEmail) {
        return reply
          .status(400)
          .send({ message: "User with the same email already exists." });
      }

      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
        },
      });

      return reply.status(201).send();
    }
  );
}
