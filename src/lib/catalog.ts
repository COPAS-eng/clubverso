// Mock catalog — funciona sem DB para MVP; quando DATABASE_URL estiver configurado, usar Prisma.
export const MOCK_CATALOG = {
  continents: [{ slug: "america-do-sul", name: "América do Sul" }],
  countries: [{ slug: "brasil", name: "Brasil", continentSlug: "america-do-sul", flag: "🇧🇷" }],
  leagues: [{ slug: "brasileirao", name: "Brasileirão Série A", countrySlug: "brasil" }],
  clubs: [
    { slug: "flamengo", name: "Flamengo", shortCode: "FLA", leagueSlug: "brasileirao", countrySlug: "brasil", primaryColor: "#C3281E", secondaryColor: "#000000", licensingStatus: "NOT_VERIFIED" as const },
    { slug: "palmeiras", name: "Palmeiras", shortCode: "PAL", leagueSlug: "brasileirao", countrySlug: "brasil", primaryColor: "#006437", secondaryColor: "#FFFFFF", licensingStatus: "NOT_VERIFIED" as const },
  ],
  works: [
    {
      slug: "flamengo-1895-2026",
      clubSlug: "flamengo",
      title: "Flamengo — 1895–2026",
      subtitle: "A história em 25 páginas. Da origem náutica ao clube do povo.",
      description: "Da fundação em 1895 no Rio de Janeiro à era moderna, a trajetória rubro-negra contada em HQ premium com 25 capítulos ilustrados.",
      periodStart: 1895,
      periodEnd: 2026,
      version: "FLA-2026-V1",
      maxSupply: 10000,
      issued: 4827,
      priceCents: 4990,
      secondPriceCents: 3990,
      status: "PUBLISHED" as const,
      totalPages: 25,
      editorialClosedAt: "2026-08-28",
      coverImageUrl: "",
    },
  ],
};

export function getClub(slug: string) { return MOCK_CATALOG.clubs.find(c => c.slug === slug) || null; }
export function getWork(slug: string) { return MOCK_CATALOG.works.find(w => w.slug === slug) || null; }
export function getWorkByClub(clubSlug: string) { return MOCK_CATALOG.works.find(w => w.clubSlug === clubSlug) || null; }
