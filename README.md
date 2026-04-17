# eCourses — LMS SaaS Platform

> A full-stack Learning Management System built for communities. Create courses, manage modules and lessons, run live sessions, and track student progress — all under one roof.

**Live:** [ecourses.pk](https://ecourses-sigma.vercel.app) &nbsp;·&nbsp; **Status:** Active Development &nbsp;·&nbsp; **License:** MIT

---

## About

eCourses started as a personal project to scratch a real itch — most LMS platforms are either too expensive, too bloated, or too rigid for small communities and independent educators. This one is built differently: community-first, instructor-friendly, and designed to run comfortably under $10/month even at scale.

Built by **Ateeb** — [portfolio](https://dynamic-portfolios.vercel.app/ateeb) · also building [Vendly](https://vendly-pk.vercel.app) (future: [vendly.pk](https://vendly.pk))

This repo is open source. PRs, issues, and feedback are welcome.

---

## What's Built So Far

### Admin Panel

- **Course Management** — create, edit, soft-delete courses with image upload via ImageKit
- **Module Management** — drag-and-drop reordering with optimistic UI, accordion view
- **Lesson Management** — drag-and-drop per module, VIDEO and SESSION lesson types
- **Instructor Assignment** — assign community members (non-student roles) as course instructors
- **Course Filters** — filter by status, time range, sort order, and instructor with URL-persisted state via nuqs
- **Pagination** — server-side pagination with a reusable pagination component
- **Soft Delete** — courses, modules, lessons, videos, sessions, and recordings all soft-delete with a 48-hour recovery window

### Architecture

- **Three-layer caching** — React Query (browser) → Next.js fetch cache (server/CDN) → Redis via Upstash (in-memory DB)
- **Tag-based cache invalidation** — bust all related cache layers in one call on any mutation
- **API security** — every internal API route verified via `x-api-secret` header, abstracted into a reusable `verifyApiRequest()` utility
- **Server Actions as proxy** — server actions attach the API secret and call internal routes, keeping secrets off the client while keeping the API mobile-ready
- **Slug generation** — URL-safe slugs with a 4-character hex suffix for uniqueness

---

## Tech Stack

| Layer         | Tech                               |
| ------------- | ---------------------------------- |
| Framework     | Next.js 15 (App Router, Turbopack) |
| Language      | TypeScript                         |
| Auth          | Clerk                              |
| Database      | PostgreSQL                         |
| ORM           | Prisma v7                          |
| Cache         | Upstash Redis                      |
| File Storage  | ImageKit                           |
| Styling       | Tailwind CSS v4                    |
| UI Components | shadcn/ui                          |
| Forms         | React Hook Form + Zod              |
| Server State  | TanStack Query v5                  |
| URL State     | nuqs                               |
| Drag and Drop | dnd-kit                            |
| Animations    | Tailwind transitions               |

---

## Project Structure

```
src/
├── app/
│   ├── [communitySlug]/
│   │   ├── admin/
│   │   │   ├── courses/
│   │   │   │   ├── page.tsx               # courses list with filters
│   │   │   │   ├── add/page.tsx           # create course
│   │   │   │   ├── edit/page.tsx          # edit course
│   │   │   │   └── manage/page.tsx        # manage modules & lessons
│   │   │   ├── analytics/
│   │   │   └── ...
│   │   ├── courses/                       # public course listing
│   │   ├── home/
│   │   └── sessions/
│   └── api/
│       ├── courses/
│       │   ├── route.ts                   # GET, POST
│       │   └── [courseId]/route.ts        # GET, PATCH, DELETE
│       ├── modules/
│       │   ├── route.ts                   # GET, POST
│       │   ├── reorder/route.ts           # PATCH
│       │   └── [moduleId]/route.ts        # DELETE
│       ├── lessons/
│       │   ├── route.ts                   # POST
│       │   ├── reorder/route.ts           # PATCH
│       │   └── [lessonId]/route.ts        # DELETE
│       ├── members/
│       │   └── instructors/
│       │       ├── route.ts               # GET non-student members
│       │       └── [userId]/route.ts      # GET single instructor
│       └── upload-auth/route.ts           # ImageKit auth
├── actions/                               # server actions (API proxies)
│   ├── courses.ts
│   ├── modules.ts
│   ├── lessons.ts
│   └── members.ts
├── components/
│   ├── courses/
│   ├── modules/
│   ├── lessons/
│   └── inputs/
├── hooks/
│   ├── use-course-form.ts
│   ├── use-course-filters.ts
│   ├── use-courses.ts
│   ├── use-instructor.ts
│   └── use-modules.ts
├── lib/
│   ├── api.ts                             # verifyApiRequest, generateSlug, validateWithRegex
│   ├── cache.ts                           # withCache, bustCache
│   ├── redis.ts                           # Upstash Redis client
│   └── prisma.ts
└── types/
    ├── course.ts                          # Prisma.CourseGetPayload types
    └── module.ts                          # Prisma.ModuleGetPayload types
```

---

## Data Model (Key Relations)

```
Community
  └── Course (communityId, instructorId?)
        └── Module (courseId, index: Float)
              └── Lesson (moduleId, index: Float, type: VIDEO | SESSION)
                    ├── Video (lessonId)
                    └── Session (communityId)
                          └── Recording (sessionId)

User
  ├── CommunityMember (role: OWNER | ADMIN | MODERATOR | INSTRUCTOR | STUDENT)
  ├── Enrollment (courseId)
  ├── WatchProgress (videoId | recordingId)
  └── LessonCompletion (lessonId)
```

`Float` is used for `index` fields on modules and lessons specifically to support conflict-free drag-and-drop reordering — fractional temp values (e.g. `1.5`) are used in a two-pass transaction to avoid unique constraint violations during reorder.

---

## Caching Strategy

Every read goes through three layers before hitting the database:

```
Browser request
  → React Query (in-memory, browser)        staleTime: 5 hours
  → Next.js fetch cache (server/CDN)        revalidate: 300s
  → Upstash Redis (in-memory DB)            TTL: 300s–24h
  → PostgreSQL                              only on genuine cache miss
```

Cache invalidation is tag-based — one `bustCache(['courses', 'courses:pak-tech'])` call nukes both Redis keys and Next.js fetch cache simultaneously. React Query is invalidated client-side via `queryClient.invalidateQueries()` after every mutation.

Redis uses `allkeys-lru` eviction policy — frequently accessed data stays in memory, stale data gets evicted automatically.

---

## API Security

All internal API routes are protected by a shared secret:

```ts
// every route starts with:
const authError = verifyApiRequest(req)
if (authError) return authError
```

The secret never touches the client — server actions attach it server-side before calling API routes. This means the same API routes work for both the Next.js frontend (via server actions) and a future mobile app (with the secret stored in mobile env config).

---

## Getting Started

```bash
# clone
git clone https://github.com/your-username/ecourses
cd ecourses

# install
pnpm install

# env
cp .env.example .env.local
# fill in the values below

# db
pnpm prisma generate
pnpm prisma migrate dev

# run
pnpm dev
```

### Environment Variables

```bash
# Database
DATABASE_URL=""

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# API Security
API_SECRET=""

# ImageKit
IMAGEKIT_PUBLIC_KEY=""
IMAGEKIT_PRIVATE_KEY=""
IMAGEKIT_URL_ENDPOINT=""

# Upstash Redis
UPSTASH_REDIS_URL=""
UPSTASH_REDIS_TOKEN=""
```

---

## Roadmap

- [ ] Public course pages for students
- [ ] Video upload and playback (ImageKit video)
- [ ] Session scheduling and live links
- [ ] Student enrollment and progress tracking
- [ ] Watch progress and lesson completion
- [ ] Analytics dashboard
- [ ] Community invite system
- [ ] Mobile app (React Native) — same API, no separate backend
- [ ] Soft-delete recovery UI (48-hour window)
- [ ] Email notifications

---

## Contributing

This is an open source project and contributions are welcome. Open an issue first if you're planning something large — happy to discuss direction before you invest the time.

```bash
# create a branch
git checkout -b feature/your-feature

# commit
git commit -m "feat: your feature"

# push and open a PR
git push origin feature/your-feature
```

---

## Author

Built by **Ateeb** as both a real product and a portfolio project.

- Portfolio: [dynamic-portfolios.vercel.app/ateeb](https://dynamic-portfolios.vercel.app/ateeb)
- Also building: [Vendly](https://vendly-pk.vercel.app) — a separate product, future domain [vendly.pk](https://vendly.pk)

---

## License

MIT — do whatever you want with it, just don't remove the attribution.

## Responsiveness

Work on making the home page responsive side-by-side along with development of new pages. moreover the figma design suits `xl:` i.e. a min-width of 1280px more than `lg:`
Write your code in accordance to this approach
