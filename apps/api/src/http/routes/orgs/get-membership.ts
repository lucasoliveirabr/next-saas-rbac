import * as z from "zod";
import { auth } from "@/http/middlewares/auth";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { roleSchema } from "@saas/auth";

export async function getMembership(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/organizations/:slug/membership",
      {
        schema: {
          tags: ["Organization"],
          summary: "Get user membership on organization",
          security: [{ apiKey: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            200: z.object({
              membership: z.object({
                id: z.uuid(),
                role: roleSchema,
                organizationId: z.uuid(),
              }),
            }),
          },
        },
      },
      async (request) => {
        const { slug } = request.params;
        const { membership } = await request.getUserMembership(slug);

        return {
          membership: {
            id: membership.id,
            role: membership.role,
            organizationId: membership.organizationId,
          },
        };
      }
    );
}
