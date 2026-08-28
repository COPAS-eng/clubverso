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
    ["Origem", "origem"], ["Primeiros anos","primeiros-anos"], ["Consolidação no futebol","consolidacao-futebol"],
    ["Primeiros grandes momentos","primeiros-momentos"], ["Crescimento","crescimento"], ["Formação da identidade","formacao-identidade"],
    ["Primeira grande geração","primeira-geracao"], ["Ascensão","ascensao"], ["Primeiro grande marco","marco-1"],
    ["Grande conquista","grande-conquista"], ["Era de ouro","era-de-ouro"], ["Transição","transicao"],
    ["Nova geração","nova-geracao"], ["Reconstrução","reconstrucao"], ["Grande momento moderno","momento-moderno"],
    ["Capítulo histórico de destaque","capitulo-destaque"], ["Continuidade","continuidade"], ["Nova grande conquista","nova-conquista"],
    ["Desafios","desafios"], ["Nova fase","nova-fase"], ["Grande momento recente","momento-recente"],
    ["Ano de fechamento","ano-fechamento"], ["Ídolos e legado","idolos-legado"], ["Torcida, cultura e identidade","torcida-cultura"], ["Encerramento + autenticação","encerramento-autenticacao"],
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

  console.log("Seed OK:", { continent: continent.slug, country: country.slug, league: league.slug, club: flamengo.slug, work: work.slug });
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
