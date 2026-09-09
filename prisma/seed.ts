import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding CLUBEVERSO...");

  const continent = await prisma.continent.upsert({
    where: { slug: "america-do-sul" },
    update: {},
    create: { slug: "america-do-sul", name: "América do Sul" },
  });

  const country = await prisma.country.upsert({
    where: { slug: "brasil" },
    update: {},
    create: { slug: "brasil", name: "Brasil", continentId: continent.id },
  });

  const league = await prisma.league.upsert({
    where: { slug: "brasileirao" },
    update: {},
    create: { slug: "brasileirao", name: "Brasileirão Série A", countryId: country.id },
  });

  const flamengo = await prisma.club.upsert({
    where: { slug: "flamengo" },
    update: {},
    create: {
      slug: "flamengo", name: "Clube de Regatas do Flamengo", shortCode: "FLA",
      countryId: country.id, leagueId: league.id,
      primaryColor: "#C3281E", secondaryColor: "#000000",
      licensingStatus: "NOT_VERIFIED",
    },
  });
  for (const c of [
    { slug: "palmeiras", name: "Sociedade Esportiva Palmeiras", shortCode: "PAL", primaryColor: "#006437", secondaryColor: "#FFFFFF" },
    { slug: "corinthians", name: "Sport Club Corinthians Paulista", shortCode: "COR", primaryColor: "#000000", secondaryColor: "#FFFFFF" },
    { slug: "sao-paulo", name: "São Paulo Futebol Clube", shortCode: "SAO", primaryColor: "#FE0000", secondaryColor: "#000000" },
    { slug: "santos", name: "Santos Futebol Clube", shortCode: "SAN", primaryColor: "#FFFFFF", secondaryColor: "#000000" },
    { slug: "vasco", name: "Club de Regatas Vasco da Gama", shortCode: "VAS", primaryColor: "#000000", secondaryColor: "#FFFFFF" },
    { slug: "cruzeiro", name: "Cruzeiro Esporte Clube", shortCode: "CRU", primaryColor: "#003399", secondaryColor: "#FFFFFF" },
    { slug: "gremio", name: "Grêmio Foot-Ball Porto Alegrense", shortCode: "GRE", primaryColor: "#0099DD", secondaryColor: "#000000" },
  ]) {
    await prisma.club.upsert({
      where: { slug: c.slug },
      update: {},
      create: { slug: c.slug, name: c.name, shortCode: c.shortCode, countryId: country.id, leagueId: league.id, primaryColor: c.primaryColor, secondaryColor: c.secondaryColor, licensingStatus: "NOT_VERIFIED" },
    });
  }

  const work = await prisma.work.upsert({
    where: { slug: "flamengo-1895-2026" },
    update: {},
    create: {
      slug: "flamengo-1895-2026", clubId: flamengo.id,
      title: "Flamengo — 1895–2026", subtitle: "Da origem náutica ao clube do povo. 25 páginas originais.",
      description: "Obra HQ premium que conta a evolução do Flamengo desde 1895 até 2026: origem náutica, consolidação no futebol (1911), eras, ídolos, conquistas e torcida. Fechamento editorial em 28/08/2026.",
      periodStart: 1895, periodEnd: 2026, version: "FLA-2026-V1",
      maxSupply: 10000, priceCents: 4990, secondPriceCents: 3990,
      status: "PUBLISHED", editorialClosedAt: new Date("2026-08-28"),
      totalPages: 25,
    },
  });

  const pages = [
    ["Capa — O Mengão em quadrinhos", "capa"], ["A fundação — 1895","fundacao"], ["As cores rubro-negras","cores-rubro-negras"],
    ["O primeiro grande ídolo","primeiro-idolo"], ["O estádio que vira casa","estadio"], ["A era de ouro dos anos 1940","era-de-ouro-1940"],
    ["A conquista do primeiro título","primeiro-titulo"], ["O time de 1981","time-1981"], ["Brasileirão 1987","brasileirao-1987"],
    ["Anos 90 — raça e ídolos","anos-90"], ["Domínio nacional — anos 2000","anos-2000"], ["Década de 2010","decada-2010"],
    ["2014 — o ano mágico","ano-2014"], ["2015 — o continente é rubro-negro","ano-2015"], ["2016 — a nova geração","ano-2016"],
    ["2017 — superação e conquistas","ano-2017"], ["2018 — domínio e recorde","ano-2018"], ["2019 — consagração mundial","ano-2019"],
    ["2020 — resiliência, fé e mais glórias","ano-2020-resiliencia"], ["2021 — reinvenção, superação e mais uma taça","ano-2021-reinvencao"],
    ["2020 — o desafio de continuar no topo","ano-2020"], ["2021 — uma final que quase virou glória","ano-2021"], ["2024 — raça, união e conquista","ano-2024"],
    ["Símbolos e tradições","simbolos-tradicoes"], ["Mais que um clube","mais-que-um-clube"], ["O futuro é rubro-negro","futuro-rubro-negro"],
  ];
  for (let i = 0; i < pages.length; i++) {
    await prisma.workPage.upsert({
      where: { workId_pageNumber: { workId: work.id, pageNumber: i + 1 } },
      update: { title: pages[i][0], slug: pages[i][1] },
      create: { workId: work.id, pageNumber: i + 1, title: pages[i][0], slug: pages[i][1] },
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL || "admin@clubverso.com";
  const adminPass = process.env.ADMIN_PASSWORD || "Clubverso@2026";
  const hash = await bcrypt.hash(adminPass, 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash: hash, role: "ADMIN" },
    create: { email: adminEmail, name: "Admin Clubverso", passwordHash: hash, role: "ADMIN" },
  });
  // admin adicional solicitado
  const rafaHash = await bcrypt.hash("58079", 10);
  await prisma.user.upsert({
    where: { email: "rafaelrabir@gmail.com" },
    update: { passwordHash: rafaHash, role: "ADMIN" },
    create: { email: "rafaelrabir@gmail.com", name: "Rafael Rabir", passwordHash: rafaHash, role: "ADMIN" },
  });

  console.log("Seed OK:", { continent: continent.slug, country: country.slug, league: league.slug, club: flamengo.slug, work: work.slug });
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
