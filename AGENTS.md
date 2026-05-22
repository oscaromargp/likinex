<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:ai-image-creator -->
# AI Image Creator Skill

Skill installed at `/home/gopo/.claude/skills/ai-image-creator/` (and for opencode at `~/.config/opencode/skills/ai-image-creator/`).

## Setup
- OpenRouter sub-key configured in `~/.opencode-openrouter-key` and `~/.bashrc`/`~/.zshrc`
- Provisioning key: `~/.opencode-openrouter-key` for creating more sub-keys
- Working key env var: `AI_IMG_CREATOR_OPENROUTER_KEY`

## Usage
```bash
export AI_IMG_CREATOR_OPENROUTER_KEY=sk-or-...
uv run python3 /home/gopo/.claude/skills/ai-image-creator/scripts/generate-image.py \
  -o "public/generated/output.png" -m flux2 -a "16:9" -s "2K" --prompt "description"
```

## Generated Assets
- `public/generated/hero-visual.png` (2048x1136, 16:9 hero visual)
- `public/generated/likinex-logo.png` (2048x2048, RGBA transparent bg logo)

## Models
- `flux2` — FLUX.2 Max (default, works great)
- `gemini` — Google Gemini 3.1 Flash (needs higher credit limit)
- `riverflow` — Sourceful Riverflow v2 Pro
- `seedream` — ByteDance SeedDream 4.5
- `gpt5` — OpenAI GPT-5 Image
- `gpt5.4` — OpenAI GPT-5.4 Image 2
<!-- END:ai-image-creator -->

<!-- BEGIN:global-skills-catalog -->
# Global Skills Catalog — 1,500+ installed

## Skill Repos Instalados Globalmente

| Repositorio | Skills | Instalado en | Método |
|---|---|---|---|
| **sickn33/antigravity-awesome-skills** | 1,464+ | `~/.config/opencode/skills/` + `~/.claude/skills/` | `npx antigravity-awesome-skills` |
| **obra/superpowers** | 14 (TDD workflow) | `~/.config/opencode/skills/` + `~/.claude/skills/` | Copia manual |

## Cómo usar un skill

En cualquier sesión, invoca un skill por nombre:
```
Usa el skill [skill-name] para...
```
O en sistemas compatibles, con `@skill-name`.

---

## Skills más relevantes para LikineX

### 🎨 UI/UX & Diseño
| Skill | Qué hace |
|---|---|
| `shadcn` | Componentes shadcn/ui — styling, forms, iconos, CLI production-grade |
| `tailwind-patterns` | Tailwind CSS v4 — CSS-first config, Oxide engine, design tokens |
| `tailwind-design-system` | Design tokens, variantes, responsive, dark mode, a11y |
| `ui-ux-pro-max` | 50+ estilos, 97 paletas, 57 fuentes, 99 UX guidelines |
| `frontend-design` | Anti-pattern enforcement — evita el diseño genérico |
| `radix-ui-design-system` | Radix UI headless, theming, WCAG 2.1 AA/AAA (853 líneas) |
| `baseline-ui` | Anti-slop UI — animaciones, tipografía, validación |
| `high-end-visual-design` | Awwwards-tier — Geist/Clash Display, motion choreography |
| `scroll-experience` | GSAP ScrollTrigger, Framer Motion, parallax storytelling |

### ⚛️ Next.js & React
| Skill | Qué hace |
|---|---|
| `nextjs-app-router-patterns` | App Router, Server Components, Server Actions |
| `nextjs-best-practices` | Server vs Client Components, data fetching, layouts |
| `react-best-practices` | 45 reglas Vercel — waterfall elimination, bundle optimization |
| `tanstack-query-expert` | Cache invalidation, optimistic updates, SSR hydration |
| `trpc-fullstack` | Type-safe APIs end-to-end con tRPC + Next.js |

### 🗄️ Base de Datos & Backend
| Skill | Qué hace |
|---|---|
| `drizzle-orm-expert` | Type-safe DB, schema design, migrations, Neon/Supabase |
| `postgres-best-practices` | Por Supabase — query perf, RLS, indexing, connection mgmt |
| `nextjs-supabase-auth` | Supabase Auth + Next.js App Router — SSR, middleware, RLS |
| `stripe-integration` | Checkout Sessions, subscriptions, webhooks, PCI |

### 🤖 AI & Automatización
| Skill | Qué hace |
|---|---|
| `vercel-ai-sdk-expert` | Vercel AI SDK — streamText, useChat, tool calling |
| `3d-web-experience` | Three.js, React Three Fiber, WebGL |

### 🔒 Seguridad
| Skill | Qué hace |
|---|---|
| `security-auditor` | Auditoría de seguridad completa |
| `security-scanning-security-sast` | SAST scanning automatizado |

### 📈 SEO & Marketing
| Skill | Qué hace |
|---|---|
| `seo` | 12 sub-skills: técnico, on-page, schema, sitemaps, GEO |
| `seo-technical` | Core Web Vitals, robots.txt, hreflang |
| `seo-content-writer` | Escritura SEO optimizada |

### 🏗️ Metodología Superpowers
| Skill | Qué hace |
|---|---|
| `brainstorming` | Refinamiento de diseño por método socrático |
| `writing-plans` | Desglose de specs en tareas ejecutables |
| `test-driven-development` | TDD completo RED-GREEN-REFACTOR |
| `subagent-driven-development` | Lanzamiento de sub-agents para tareas |
| `systematic-debugging` | Debug 4 fases con defense-in-depth |
| `using-git-worktrees` | Worktrees aislados para desarrollo seguro |

## Source Repos Clonados (referencia local)
```
/home/gopo/antigravity/skill-repos/
├── antigravity-awesome-skills/    (sickn33 — 1,464 skills)
├── awesome-agent-skills/          (VoltAgent — 937 skills curados)
├── awesome-claude-skills/         (BehiSecc — 130+ listados)
├── guanyang-antigravity-skills/   (Guanyang — 81 skills)
├── heilcheng-awesome-skills/      (Heilcheng — index + web)
├── rmyndharis-antigravity-skills/ (Rmyndharis — 305 skills)
└── superpowers/                   (Obra — 14 skills metodología)
```
<!-- END:global-skills-catalog -->
