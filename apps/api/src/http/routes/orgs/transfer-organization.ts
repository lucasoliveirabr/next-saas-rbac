import * as z from "zod";
import { auth } from "@/http/middlewares/auth";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "@/lib/prisma";
import { BadRequestError } from "../_errors/bad-request-error";
import { organizationSchema } from "@saas/auth";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { getUserPermissions } from "@/utils/get-user-permissions";

export async function transferOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .patch(
      "/organizations/:slug/owner",
      {
        schema: {
          tags: ["Organization"],
          summary: "Transfer organization ownership",
          security: [{ apiKey: [] }],
          params: z.object({
            slug: z.string(),
          }),
          body: z.object({
            transferToUserId: z.uuid(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params;
        const userId = await request.getCurrentUserId();
        const { membership, organization } =
          await request.getUserMembership(slug);
        const authOrganization = organizationSchema.parse(organization);

        const { cannot } = getUserPermissions(userId, membership.role);

        if (cannot("transfer_ownership", authOrganization)) {
          throw new UnauthorizedError(
            "You are not allowed to transfer this organization ownership."
          );
        }

        const { transferToUserId } = request.body;

        const transferToMembership = await prisma.member.findUnique({
          where: {
            organizationId_userId: {
              organizationId: organization.id,
              userId: transferToUserId,
            },
          },
        });

        if (!transferToMembership) {
          throw new BadRequestError(
            "Target user is not a member of this organization"
          );
        }

        await prisma.$transaction([
          prisma.member.update({
            data: {
              role: "ADMIN",
            },
            where: {
              organizationId_userId: {
                organizationId: organization.id,
                userId: transferToUserId,
              },
            },
          }),
          prisma.organization.update({
            data: {
              ownerId: transferToUserId,
            },
            where: {
              id: organization.id,
            },
          }),
        ]);

        return reply.status(204).send();
      }
    );
}
