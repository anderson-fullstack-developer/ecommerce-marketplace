import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { password: hashedPassword },
      create: { email: adminEmail, password: hashedPassword, role: "ADMIN" },
    });
  } else {
    console.warn(
      "ADMIN_EMAIL/ADMIN_PASSWORD não definidos — utilizador admin não foi criado."
    );
  }

  const categories = [
    { name: "Café", slug: "cafe" },
    { name: "Cacau", slug: "cacau" },
    { name: "Chocolate", slug: "chocolate" },
    { name: "Artesanato", slug: "artesanato" },
  ];

  const createdCategories = await Promise.all(
    categories.map((category) =>
      prisma.category.upsert({
        where: { slug: category.slug },
        update: {},
        create: category,
      })
    )
  );

  const categoryIdBySlug = Object.fromEntries(
    createdCategories.map((category) => [category.slug, category.id])
  );

  const products = [
    {
      name: "Café de São Tomé",
      slug: "cafe-de-sao-tome",
      description:
        "Café arábica cultivado nas terras vulcânicas de São Tomé, torrado artesanalmente.",
      price: 8.5,
      imageUrl: "https://placehold.co/600x600?text=Cafe+de+Sao+Tome",
      stock: 50,
      categorySlug: "cafe",
    },
    {
      name: "Chocolate artesanal",
      slug: "chocolate-artesanal",
      description:
        "Chocolate produzido de forma artesanal a partir de cacau são-tomense de origem única.",
      price: 6.9,
      imageUrl: "https://placehold.co/600x600?text=Chocolate+Artesanal",
      stock: 40,
      categorySlug: "chocolate",
    },
    {
      name: "Cacau",
      slug: "cacau-sao-tome",
      description:
        "Cacau em amêndoa de São Tomé, um dos mais apreciados do mundo pela sua qualidade.",
      price: 5.5,
      imageUrl: "https://placehold.co/600x600?text=Cacau",
      stock: 60,
      categorySlug: "cacau",
    },
    {
      name: "Artesanato",
      slug: "artesanato-santomense",
      description:
        "Peças de artesanato tradicional feitas à mão por artesãos são-tomenses.",
      price: 15,
      imageUrl: "https://placehold.co/600x600?text=Artesanato",
      stock: 20,
      categorySlug: "artesanato",
    },
  ];

  for (const { categorySlug, ...product } of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...product,
        categoryId: categoryIdBySlug[categorySlug],
      },
    });
  }

  console.log("Seed concluído.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
