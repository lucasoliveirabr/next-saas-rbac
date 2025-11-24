import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";
import { prismaWithoutLog as prisma } from "../src/lib/prisma";

async function seed() {
  await prisma.member.deleteMany();
  await prisma.project.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.member.deleteMany();
  await prisma.invite.deleteMany();
  await prisma.account.deleteMany();
  await prisma.token.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("12345678", 1);

  const user = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "john@acme.com",
      avatarUrl: "https://github.com/github.png",
      passwordHash,
    },
  });

  const fakerUser = await prisma.user.create({
    data: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      avatarUrl: faker.image.avatarGitHub(),
      passwordHash,
    },
  });

  const fakerUser2 = await prisma.user.create({
    data: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      avatarUrl: faker.image.avatarGitHub(),
      passwordHash,
    },
  });

  await prisma.organization.create({
    data: {
      name: "Acme Inc (Admin)",
      domain: "acme.com",
      slug: "acme-admin",
      avatarUrl: faker.image.avatarGitHub(),
      shouldAttachUsersByDomain: true,
      ownerId: user.id,
      members: {
        createMany: {
          data: [
            {
              userId: user.id,
              role: "ADMIN",
            },
            {
              userId: fakerUser.id,
              role: "MEMBER",
            },
            {
              userId: fakerUser2.id,
              role: "MEMBER",
            },
          ],
        },
      },
      projects: {
        createMany: {
          data: [
            {
              name: faker.lorem.words(5),
              slug: faker.lorem.slug(5),
              description: faker.lorem.paragraph(),
              avatarUrl: faker.image.avatarGitHub(),
              ownerId: faker.helpers.arrayElement([
                user.id,
                fakerUser.id,
                fakerUser2.id,
              ]),
            },
            {
              name: faker.lorem.words(5),
              slug: faker.lorem.slug(5),
              description: faker.lorem.paragraph(),
              avatarUrl: faker.image.avatarGitHub(),
              ownerId: faker.helpers.arrayElement([
                user.id,
                fakerUser.id,
                fakerUser2.id,
              ]),
            },
            {
              name: faker.lorem.words(5),
              slug: faker.lorem.slug(5),
              description: faker.lorem.paragraph(),
              avatarUrl: faker.image.avatarGitHub(),
              ownerId: faker.helpers.arrayElement([
                user.id,
                fakerUser.id,
                fakerUser2.id,
              ]),
            },
          ],
        },
      },
    },
  });

  await prisma.organization.create({
    data: {
      name: "Acme Inc (Member)",
      slug: "acme-member",
      avatarUrl: faker.image.avatarGitHub(),
      ownerId: user.id,
      members: {
        createMany: {
          data: [
            {
              userId: user.id,
              role: "MEMBER",
            },
            {
              userId: fakerUser.id,
              role: "ADMIN",
            },
            {
              userId: fakerUser2.id,
              role: "MEMBER",
            },
          ],
        },
      },
      projects: {
        createMany: {
          data: [
            {
              name: faker.lorem.words(5),
              slug: faker.lorem.slug(5),
              description: faker.lorem.paragraph(),
              avatarUrl: faker.image.avatarGitHub(),
              ownerId: faker.helpers.arrayElement([
                user.id,
                fakerUser.id,
                fakerUser2.id,
              ]),
            },
            {
              name: faker.lorem.words(5),
              slug: faker.lorem.slug(5),
              description: faker.lorem.paragraph(),
              avatarUrl: faker.image.avatarGitHub(),
              ownerId: faker.helpers.arrayElement([
                user.id,
                fakerUser.id,
                fakerUser2.id,
              ]),
            },
            {
              name: faker.lorem.words(5),
              slug: faker.lorem.slug(5),
              description: faker.lorem.paragraph(),
              avatarUrl: faker.image.avatarGitHub(),
              ownerId: faker.helpers.arrayElement([
                user.id,
                fakerUser.id,
                fakerUser2.id,
              ]),
            },
          ],
        },
      },
    },
  });

  await prisma.organization.create({
    data: {
      name: "Acme Inc (Billing)",
      slug: "acme-billing",
      avatarUrl: faker.image.avatarGitHub(),
      ownerId: user.id,
      members: {
        createMany: {
          data: [
            {
              userId: user.id,
              role: "BILLING",
            },
            {
              userId: fakerUser.id,
              role: "ADMIN",
            },
            {
              userId: fakerUser2.id,
              role: "MEMBER",
            },
          ],
        },
      },
      projects: {
        createMany: {
          data: [
            {
              name: faker.lorem.words(5),
              slug: faker.lorem.slug(5),
              description: faker.lorem.paragraph(),
              avatarUrl: faker.image.avatarGitHub(),
              ownerId: faker.helpers.arrayElement([
                user.id,
                fakerUser.id,
                fakerUser2.id,
              ]),
            },
            {
              name: faker.lorem.words(5),
              slug: faker.lorem.slug(5),
              description: faker.lorem.paragraph(),
              avatarUrl: faker.image.avatarGitHub(),
              ownerId: faker.helpers.arrayElement([
                user.id,
                fakerUser.id,
                fakerUser2.id,
              ]),
            },
            {
              name: faker.lorem.words(5),
              slug: faker.lorem.slug(5),
              description: faker.lorem.paragraph(),
              avatarUrl: faker.image.avatarGitHub(),
              ownerId: faker.helpers.arrayElement([
                user.id,
                fakerUser.id,
                fakerUser2.id,
              ]),
            },
          ],
        },
      },
    },
  });
}

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
