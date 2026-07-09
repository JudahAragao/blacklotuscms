import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getPostsByType } from '@/lib/lotus-sdk';

/* ─────────────────────────────────────────────
   SVG Icons (inline — no lucide-react dependency)
   ───────────────────────────────────────────── */
const IconArrowDown = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
);
const IconDownload = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
);
const IconMail = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
);
const IconArrowUpRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>
);
const IconArrowRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);
const IconCode2 = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>
);
const IconServer = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>
);
const IconDatabase = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>
);
const IconWrench = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
);
const IconGraduation = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
);
const IconGithub = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
);
const IconLinkedin = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);
const IconRocket = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
);
const IconSend = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
);
const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
);

/* ─────────────────────────────────────────────
   Static Data (matching base-theme-portfolio)
   ───────────────────────────────────────────── */
const SKILL_GROUPS = [
  { icon: IconCode2, title: 'Frontend', items: ['React', 'TypeScript', 'Tailwind', 'TanStack', 'Vite', 'Framer Motion'] },
  { icon: IconServer, title: 'Backend', items: ['Node.js', 'NestJS', 'Rust', 'Go', 'REST', 'gRPC'] },
  { icon: IconDatabase, title: 'Databases', items: ['PostgreSQL', 'Redis', 'MongoDB', 'SQLite', 'Prisma'] },
  { icon: IconWrench, title: 'DevOps & Tools', items: ['Docker', 'GitHub Actions', 'Terraform', 'Cloudflare', 'Linux', 'Grafana'] },
];

const PROJECTS = [
  {
    name: 'CRSBin',
    description: 'Cofre de secrets self-hosted com envelope encryption, versionamento e trilha de auditoria imutável. Zero-trust por padrão.',
    tags: ['Node.js', 'TypeScript', 'Postgres', 'Cryptography'],
    href: 'https://github.com/',
  },
  {
    name: 'KMS Reston Service',
    description: 'Key Management Service com rotação de chaves sem downtime, assinatura JWT delegada e integração via mTLS.',
    tags: ['Rust', 'AES-GCM', 'gRPC', 'Observability'],
    href: 'https://github.com/',
  },
];

const ABOUT_INFO = [
  ['Foco', 'Segurança & Backend'],
  ['Base', 'Brasil · Remoto'],
  ['Idiomas', 'PT · EN'],
  ['Método', 'Menos, com mais cuidado'],
];

const CONTACT_LINKS = [
  { icon: IconGithub, label: 'github.com/judahdev', href: 'https://github.com/' },
  { icon: IconLinkedin, label: 'linkedin.com/in/judah-aragao', href: 'https://linkedin.com/' },
  { icon: IconMail, label: 'judah@aragao.dev', href: 'mailto:judah@aragao.dev' },
];

/* ─────────────────────────────────────────────
   Background FX Component (CSS-only)
   ───────────────────────────────────────────── */
function VelarisBackground() {
  return (
    <div className="vj-bg" aria-hidden>
      <div className="vj-bg__base" />
      <div className="vj-bg__radial" />

      {/* Topographic curves */}
      <svg className="vj-bg__topo" viewBox="0 0 1440 900" preserveAspectRatio="none">
        <defs>
          <linearGradient id="vj-topo" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4B5A3A" />
            <stop offset="100%" stopColor="#B08A3C" />
          </linearGradient>
        </defs>
        {Array.from({ length: 10 }).map((_, i) => {
          const y = 90 + i * 78;
          const amp = 32 + i * 4;
          return (
            <path
              key={i}
              d={`M-20 ${y} C 200 ${y - amp}, 400 ${y + amp}, 720 ${y} S 1240 ${y - amp}, 1460 ${y}`}
              fill="none"
              stroke="url(#vj-topo)"
              strokeWidth={1}
              strokeDasharray="4 12"
              style={{ animation: `vj-dash ${45 + i * 6}s linear infinite` }}
            />
          );
        })}
      </svg>

      {/* Particles */}
      <div className="vj-bg__particles">
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className="vj-bg__particle"
            style={{
              left: `${(i * 73) % 100}%`,
              bottom: '-10vh',
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              background: i % 2 === 0 ? 'rgba(176, 138, 60, 0.8)' : 'rgba(75, 90, 58, 0.9)',
              boxShadow: '0 0 8px currentColor',
              color: 'rgba(176,138,60,0.6)',
              animation: `vj-float-up ${18 + (i % 6) * 4}s linear ${i * 1.3}s infinite`,
            }}
          />
        ))}
      </div>

      <div className="vj-bg__vignette" />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Section: Hero
   ───────────────────────────────────────────── */
function HeroSection() {
  return (
    <section id="hero" className="relative min-h-[100svh] pt-28 pb-16 flex items-center">
      <div className="vj-container grid w-full grid-cols-1 items-center gap-12 md:grid-cols-[1.3fr_1fr]">
        <div>
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--vj-gold)]/30 bg-[var(--vj-gold)]/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-[var(--vj-gold)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--vj-gold)]" />
            Engineered intelligence
          </p>
          <h1 className="text-5xl font-semibold leading-[1.02] text-[var(--vj-bone)] sm:text-6xl md:text-7xl" style={{ fontFamily: 'var(--font-display)' }}>
            Judah <span className="vj-text-gradient">de Aragão</span>
          </h1>
          <p className="mt-4 text-lg text-[var(--color-muted-foreground)] md:text-xl">
            Desenvolvedor Fullstack
          </p>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--vj-bone)]/80 md:text-lg">
            Apaixonado por criar experiências digitais elegantes e
            performáticas — na fronteira entre lógica, criatividade,
            misticismo e realidade.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <a href="/cv-judah-aragao.pdf" download className="vj-btn-primary">
              <IconDownload /> Download CV
            </a>
            <a href="#contato" className="vj-btn-ghost">
              <IconMail /> Contatar-me
            </a>
          </div>

          <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-white/[0.05] pt-6 text-left">
            <div>
              <dt className="text-xs uppercase tracking-widest text-[var(--color-muted-foreground)]">Experiência</dt>
              <dd className="mt-1 text-2xl text-[var(--vj-bone)]" style={{ fontFamily: 'var(--font-display)' }}>
                3<span className="text-[var(--vj-gold)]">+</span>
                <span className="ml-1 text-sm text-[var(--color-muted-foreground)]">anos</span>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-[var(--color-muted-foreground)]">Projetos</dt>
              <dd className="mt-1 text-2xl text-[var(--vj-bone)]" style={{ fontFamily: 'var(--font-display)' }}>
                12<span className="text-[var(--vj-gold)]">+</span>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-[var(--color-muted-foreground)]">Artigos</dt>
              <dd className="mt-1 text-2xl text-[var(--vj-bone)]" style={{ fontFamily: 'var(--font-display)' }}>
                3<span className="text-[var(--vj-gold)]">+</span>
              </dd>
            </div>
          </dl>
        </div>

        {/* Avatar placeholder */}
        <div className="relative mx-auto md:ml-auto">
          <div className="relative">
            <div
              aria-hidden
              className="absolute -inset-4 rounded-[2rem] opacity-70 blur-2xl"
              style={{
                background: 'conic-gradient(from 90deg, rgba(176,138,60,0.6), rgba(75,90,58,0.4), transparent 70%)',
              }}
            />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-[var(--vj-gold)]/30 bg-[var(--color-card)] p-1">
              <div className="h-[320px] w-[280px] rounded-[1.5rem] bg-gradient-to-br from-[var(--vj-olive-dark)] to-[var(--vj-graphite)] flex items-center justify-center md:h-[420px] md:w-[340px]">
                <span className="text-6xl opacity-20" style={{ fontFamily: 'var(--font-display)' }}>JA</span>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 rounded-full border border-[var(--vj-gold)]/30 bg-[var(--vj-graphite)]/80 px-3 py-1.5 text-xs text-[var(--vj-bone)] backdrop-blur">
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-400" />
              Disponível para novos projetos
            </div>
          </div>
        </div>
      </div>

      <a
        href="#sobre"
        aria-label="Rolar para Sobre"
        className="absolute left-1/2 bottom-6 -translate-x-1/2 text-[var(--color-muted-foreground)] hover:text-[var(--vj-gold)]"
        style={{ animation: 'vj-bounce-soft 2.4s ease-in-out infinite' }}
      >
        <IconArrowDown />
      </a>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Section: Sobre
   ───────────────────────────────────────────── */
function SobreSection() {
  return (
    <section id="sobre" className="vj-section py-24">
      <div className="mb-12 max-w-2xl">
        <p className="vj-section-eyebrow">/ 01</p>
        <h2 className="vj-section-title">Sobre mim</h2>
      </div>

      <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5 text-base leading-relaxed text-[var(--vj-bone)]/85 md:text-lg">
          <p>
            Sou desenvolvedor fullstack com <strong className="text-[var(--vj-bone)]">3 anos</strong> construindo
            sistemas em produção — do frontend acessível às camadas críticas de
            criptografia e infraestrutura. Meu trabalho é atravessado por uma
            obsessão saudável por <em>código limpo</em> e arquiteturas que envelhecem bem.
          </p>
          <p>
            Gosto de resolver problemas complexos com engenharia discreta:
            simetria entre backend e frontend, decisões escritas, testes que
            servem de documentação e observabilidade que fala. Fora do editor,
            estudo montanhas — de literatura mística a caminhadas de fim de semana.
          </p>
          <blockquote className="border-l-2 border-[var(--vj-gold)]/70 pl-5 text-lg italic text-[var(--vj-bone)]/90" style={{ fontFamily: 'var(--font-display)' }}>
            &ldquo;A montanha não se conquista. Ela ensina a subir devagar, com
            atenção — e é assim que gosto de construir software.&rdquo;
          </blockquote>
        </div>

        <ul className="grid grid-cols-2 gap-3">
          {ABOUT_INFO.map(([k, v]) => (
            <li key={k} className="vj-glass rounded-xl p-4">
              <p className="text-xs uppercase tracking-widest text-[var(--color-muted-foreground)]">{k}</p>
              <p className="mt-1 text-base text-[var(--vj-bone)]" style={{ fontFamily: 'var(--font-display)' }}>{v}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Section: Projetos
   ───────────────────────────────────────────── */
function ProjetosSection() {
  return (
    <section id="projetos" className="vj-section py-24">
      <div className="mb-12 max-w-2xl">
        <p className="vj-section-eyebrow">/ 02</p>
        <h2 className="vj-section-title">Projetos</h2>
        <p className="vj-section-subtitle">
          Uma seleção de trabalhos que demonstram minhas habilidades técnicas e criativas.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {PROJECTS.map((p) => (
          <a
            key={p.name}
            href={p.href}
            target="_blank"
            rel="noreferrer"
            className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[var(--color-card)]/60 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--vj-gold)]/50"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background: 'radial-gradient(400px 200px at 50% 0%, rgba(176,138,60,0.22) 0%, transparent 60%)',
              }}
            />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-[var(--vj-gold)]">Case study</p>
                <h3 className="mt-2 text-2xl font-semibold text-[var(--vj-bone)]" style={{ fontFamily: 'var(--font-display)' }}>
                  {p.name}
                </h3>
              </div>
              <IconArrowUpRight />
            </div>
            <p className="relative mt-4 text-sm leading-relaxed text-[var(--vj-bone)]/75">{p.description}</p>
            <div className="relative mt-6 flex flex-wrap gap-2">
              {p.tags.map((t) => (
                <span key={t} className="vj-tag">{t}</span>
              ))}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Section: Habilidades
   ───────────────────────────────────────────── */
function HabilidadesSection() {
  return (
    <section id="habilidades" className="vj-section py-24">
      <div className="mb-12 max-w-2xl">
        <p className="vj-section-eyebrow">/ 03</p>
        <h2 className="vj-section-title">Habilidades</h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {SKILL_GROUPS.map(({ icon: Icon, title, items }) => (
          <div
            key={title}
            className="group rounded-2xl border border-white/[0.06] bg-[var(--color-card)]/50 p-6 transition-colors hover:border-[var(--vj-gold)]/40"
          >
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--vj-gold)]/30 bg-[var(--vj-gold)]/10 text-[var(--vj-gold)]">
              <Icon />
            </div>
            <h3 className="text-lg font-semibold text-[var(--vj-bone)]" style={{ fontFamily: 'var(--font-display)' }}>
              {title}
            </h3>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {items.map((it) => (
                <li key={it} className="rounded-md border border-white/[0.05] bg-white/[0.04] px-2 py-1 text-[11px] font-medium text-[var(--vj-bone)]/80">
                  {it}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Section: Formação
   ───────────────────────────────────────────── */
function FormacaoSection() {
  return (
    <section id="formacao" className="vj-section py-24">
      <div className="mb-12 max-w-2xl">
        <p className="vj-section-eyebrow">/ 04</p>
        <h2 className="vj-section-title">Formação</h2>
      </div>

      <div className="vj-glass rounded-2xl p-7 md:p-9">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
          <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[var(--vj-gold)]/30 bg-[var(--vj-gold)]/10 text-[var(--vj-gold)]">
            <IconGraduation />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-xl font-semibold text-[var(--vj-bone)] md:text-2xl" style={{ fontFamily: 'var(--font-display)' }}>
                Tecnólogo em Análise e Desenvolvimento de Sistemas
              </h3>
              <span className="text-xs uppercase tracking-widest text-[var(--vj-gold)]">
                2022 — 2025
              </span>
            </div>
            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">Instituto Federal · Brasil</p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--vj-bone)]/80">
              Base sólida em algoritmos, engenharia de software, banco de dados
              e redes. Trabalho de conclusão em criptografia aplicada e
              gerenciamento de chaves em ambientes distribuídos.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {['Algoritmos', 'Sistemas Distribuídos', 'Criptografia', 'Redes'].map((t) => (
                <span key={t} className="vj-tag">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Section: Blog Teaser (dynamic from CMS)
   ───────────────────────────────────────────── */
async function BlogTeaserSection() {
  const posts = await getPostsByType('blog', 3);
  const sorted = [...posts].sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  const featured = sorted[0];
  const secondary = sorted.slice(1, 3);

  return (
    <section id="blog" className="vj-section py-24">
      <div className="mb-12 max-w-2xl">
        <p className="vj-section-eyebrow">/ 05</p>
        <h2 className="vj-section-title">Blog</h2>
        <p className="vj-section-subtitle">
          Artigos sobre desenvolvimento, arquitetura de software e estudos de caso.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
        {/* Featured post */}
        {featured ? (
          <a
            href={`/${featured.slug}`}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-[var(--color-card)]/60 p-7 transition-all hover:-translate-y-1 hover:border-[var(--vj-gold)]/50 md:p-9"
          >
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-[var(--vj-gold)]/40 bg-[var(--vj-gold)]/10 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-widest text-[var(--vj-gold)]">
                {(featured.postType as any)?.label || 'Post'}
              </span>
              <span className="text-xs text-[var(--color-muted-foreground)]">
                {featured.publishedAt ? new Date(featured.publishedAt).toLocaleDateString() : ''}
              </span>
            </div>
            <h3 className="mt-5 text-2xl font-semibold text-[var(--vj-bone)] md:text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
              {featured.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[var(--vj-bone)]/75 md:text-base line-clamp-3">
              {featured.content?.substring(0, 200)}...
            </p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--vj-gold)] transition-transform group-hover:translate-x-0.5">
              Ler artigo <IconArrowRight />
            </span>
          </a>
        ) : (
          <div className="vj-glass rounded-2xl p-7 md:p-9 flex items-center justify-center">
            <p className="text-[var(--color-muted-foreground)] italic">Nenhum artigo publicado ainda.</p>
          </div>
        )}

        {/* Secondary posts */}
        <div className="flex flex-col gap-4">
          {secondary.map((post: any) => (
            <a
              key={post.id}
              href={`/${post.slug}`}
              className="group flex-1 rounded-2xl border border-white/[0.05] bg-[var(--color-card)]/40 p-5 transition-colors hover:border-[var(--vj-gold)]/40"
            >
              <div className="flex items-center gap-2 text-xs text-[var(--color-muted-foreground)]">
                <span className="rounded border border-white/[0.06] px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-[var(--vj-gold)]/80">
                  {(post.postType as any)?.label || 'Post'}
                </span>
                {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ''}
              </div>
              <p className="mt-3 text-base font-medium text-[var(--vj-bone)] group-hover:text-[var(--vj-gold)]" style={{ fontFamily: 'var(--font-display)' }}>
                {post.title}
              </p>
            </a>
          ))}

          <a
            href="/archive"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--vj-gold)]/40 px-4 py-3 text-sm font-medium text-[var(--vj-gold)] transition-colors hover:bg-[var(--vj-gold)]/10"
          >
            Ver todos os artigos <IconArrowRight />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Section: Contato
   ───────────────────────────────────────────── */
function ContatoSection() {
  return (
    <section id="contato" className="vj-section py-24">
      <div className="mb-12 max-w-2xl">
        <p className="vj-section-eyebrow">/ 06</p>
        <h2 className="vj-section-title inline-flex items-center gap-3">
          Vamos conversar? <IconRocket />
        </h2>
        <p className="vj-section-subtitle">
          Aberto a projetos, colaborações e ideias — especialmente onde segurança e experiência precisam andar juntas.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          <p className="text-base leading-relaxed text-[var(--vj-bone)]/80">
            Prefere ir direto? Me encontra pelos canais abaixo — respondo em até 48h.
          </p>
          <ul className="space-y-3">
            {CONTACT_LINKS.map(({ icon: Icon, label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[var(--color-card)]/40 px-4 py-3 text-sm text-[var(--vj-bone)]/85 transition-colors hover:border-[var(--vj-gold)]/50 hover:text-[var(--vj-gold)]"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--vj-gold)]/30 bg-[var(--vj-gold)]/10 text-[var(--vj-gold)]">
                    <Icon />
                  </span>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <form className="vj-glass space-y-4 rounded-2xl p-6 md:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-widest text-[var(--color-muted-foreground)]">Nome</label>
              <input
                type="text"
                name="name"
                required
                placeholder="Como devo te chamar?"
                className="w-full rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2.5 text-sm text-[var(--vj-bone)] placeholder:text-[var(--color-muted-foreground)]/70 focus:border-[var(--vj-gold)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--vj-gold)]/20 transition-colors"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-widest text-[var(--color-muted-foreground)]">Email</label>
              <input
                type="email"
                name="email"
                required
                placeholder="voce@dominio.com"
                className="w-full rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2.5 text-sm text-[var(--vj-bone)] placeholder:text-[var(--color-muted-foreground)]/70 focus:border-[var(--vj-gold)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--vj-gold)]/20 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-widest text-[var(--color-muted-foreground)]">Mensagem</label>
            <textarea
              name="message"
              required
              rows={5}
              placeholder="Conte um pouco sobre o projeto ou ideia."
              className="w-full rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2.5 text-sm text-[var(--vj-bone)] placeholder:text-[var(--color-muted-foreground)]/70 focus:border-[var(--vj-gold)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--vj-gold)]/20 resize-none transition-colors"
            />
          </div>

          <button type="submit" className="vj-btn-primary w-full sm:w-auto">
            <IconSend /> Enviar mensagem
          </button>
        </form>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Main Page Layout
   ───────────────────────────────────────────── */
export default async function JudahPageLayout({ data }: { data: any }) {
  return (
    <div className="min-h-screen flex flex-col">
      <VelarisBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1">
          <HeroSection />
          <SobreSection />
          <ProjetosSection />
          <HabilidadesSection />
          <FormacaoSection />
          <BlogTeaserSection />
          <ContatoSection />
        </main>

        <Footer />
      </div>
    </div>
  );
}
