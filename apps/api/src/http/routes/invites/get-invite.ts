import * as z from "zod";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "@/lib/prisma";
import { BadRequestError } from "../_errors/bad-request-error";
import { roleSchema } from "@saas/auth";

export async function getInvite(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/invites/:inviteId",
    {
      schema: {
        tags: ["Invite"],
        summary: "Get an invite",
        params: z.object({
          inviteId: z.uuid(),
        }),
        response: {
          200: z.object({
            invite: z.object({
              id: z.uuid(),
              email: z.email(),
              role: roleSchema,
              createdAt: z.date(),
              author: z
                .object({
                  id: z.uuid(),
                  name: z.string().nullable(),
                  avatarUrl: z.url().nullable(),
                })
                .nullable(),
              organization: z.object({
                name: z.string(),
              }),
            }),
          }),
        },
      },
    },
    async (request) => {
      const { inviteId } = request.params;

      const invite = await prisma.invite.findUnique({
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          organization: {
            select: {
              name: true,
            },
          },
        },
        where: {
          id: inviteId,
        },
      });

      if (!invite) {
        throw new BadRequestError("Invite not found");
      }

      return { invite };
    }
  );
}
