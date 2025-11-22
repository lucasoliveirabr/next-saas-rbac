import * as z from "zod";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function authenticateWithPassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/sessions/password",
    {
      schema: {
        tags: ["Auth"],
        summary: "Authenticate with email and password",
        body: z.object({
          email: z.string(),
          password: z.string(),
        }),
        response: {
          201: z.object({
            token: z.string(),
          }),
          400: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;

      const userFromEmail = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!userFromEmail) {
        return reply.status(400).send({ message: "Invalid credentials." });
      }

      if (!userFromEmail.passwordHash) {
        return reply.status(400).send({
          message: "User does not have a password, use a social login.",
        });
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        userFromEmail.passwordHash
      );

      if (!isPasswordValid) {
        return reply.status(400).send({ message: "Invalid credentials." });
      }

      const token = await reply.jwtSign(
        {
          sub: userFromEmail.id,
        },
        {
          sign: {
            expiresIn: "7d",
          },
        }
      );

      return reply.status(201).send({ token });
    }
  );
}
