import type { Lang } from './i18n/ui';

/*
  Single source of truth for personal facts.

  Every value here traces to a real document: the July 2025 developer resume,
  the January 2026 CV, or github.com/valtzyy. Nothing is estimated, rounded up,
  or invented. If a claim has no source, it does not belong in this file.

  Anything a reader sees in prose is keyed by language. Anything that is the
  same in both, such as an email address or a framework name, is not.
*/

export const site = {
  name: 'Novaldo Putra Nugraha',
  shortName: 'Novaldo',
  initials: 'NP',
  url: 'https://novaldo.my.id',
} as const;

export const localised = {
  en: {
    role: 'Information systems undergraduate',
    /* The one-line positioning: leading and teaching the technical side. */
    positioning: 'I design the data layer, then lead the people building on top of it.',
    location: 'Sleman, Yogyakarta, Indonesia',
    description:
      'Information systems undergraduate at UPN "Veteran" Yogyakarta. Backend team lead on a dealership management system built on a PHP framework written from scratch.',
    institution: 'Universitas Pembangunan Nasional "Veteran" Yogyakarta',
    learningReason: 'high-volume distributed backend services',
  },
  id: {
    role: 'Mahasiswa Sistem Informasi',
    positioning: 'Saya merancang lapisan datanya, lalu memimpin orang-orang yang membangun di atasnya.',
    location: 'Sleman, Yogyakarta, Indonesia',
    description:
      'Mahasiswa Sistem Informasi UPN "Veteran" Yogyakarta. Ketua tim backend sebuah sistem manajemen dealer yang berdiri di atas framework PHP buatan sendiri.',
    institution: 'Universitas Pembangunan Nasional "Veteran" Yogyakarta',
    learningReason: 'layanan backend terdistribusi bervolume tinggi',
  },
} as const satisfies Record<Lang, Record<string, string>>;

export const education = {
  cohort: 2024,
  gpa: '3.78 / 4.00',
} as const;

export const contact = {
  email: 'noval27nov@gmail.com',
  phone: '081238245844',
  phoneIntl: '+62 812-3824-5844',
  github: 'https://github.com/valtzyy',
  githubHandle: 'valtzyy',
  linkedin: 'https://www.linkedin.com/in/novaldo-putra-nugraha-a8a38920a/',
  linkedinHandle: 'novaldo-putra-nugraha',
  cv: '/cv/novaldo-putra-nugraha-resume.pdf',
} as const;

export const learning = { language: 'Go' } as const;

/* Either one value used in both languages, or one per language. */
export type Localisable<T> = T | Record<Lang, T>;

interface StackGroup {
  group: Localisable<string>;
  /* Group names are translated; proper nouns like "MySQL" are not. */
  items: Localisable<readonly string[]>;
}

export const stack: StackGroup[] = [
  {
    group: { en: 'Languages', id: 'Bahasa' },
    items: ['PHP 8 (native, OOP/MVC)', 'JavaScript', 'TypeScript', 'SQL', 'C++'],
  },
  {
    group: { en: 'Databases', id: 'Basis data' },
    items: {
      en: ['MySQL', 'PDO', 'ERD design', 'Schema migration & restructuring'],
      id: ['MySQL', 'PDO', 'Perancangan ERD', 'Migrasi & restrukturisasi skema'],
    },
  },
  {
    group: { en: 'Backend', id: 'Backend' },
    items: {
      en: [
        'REST API design',
        'Authentication & authorization',
        'Role-based access control',
        'Custom MVC architecture',
      ],
      id: [
        'Perancangan REST API',
        'Autentikasi & otorisasi',
        'Role-based access control',
        'Arsitektur MVC buatan sendiri',
      ],
    },
  },
  {
    group: { en: 'Tools & infrastructure', id: 'Perkakas & infrastruktur' },
    items: ['Git', 'Vercel', 'Fly.io', 'Apache / Nginx', 'Cloudinary', 'DomPDF'],
  },
  {
    group: { en: 'Methodology', id: 'Metodologi' },
    items: ['TOGAF ADM', 'BPMN', 'ITIL', 'Scrum / Agile'],
  },
];

interface Achievement {
  title: string;
  detail: Localisable<string>;
  status: Localisable<string>;
  /* Still running, so the UI marks it in the accent colour. */
  open: boolean;
  year: string;
}

export const achievements: Achievement[] = [
  {
    title: 'Paideia x Google for Education, Gemini Academy',
    detail: { en: 'Certification programme', id: 'Program sertifikasi' },
    status: { en: 'in progress', id: 'sedang berjalan' },
    open: true,
    year: '2026',
  },
  {
    title: 'Hackathon Digital Cooperatives Expo',
    detail: {
      en: 'Ideation across four strategic pillars in a three-person team',
      id: 'Ideasi empat pilar strategis dalam tim bertiga',
    },
    status: { en: 'participant', id: 'peserta' },
    open: false,
    year: '2026',
  },
  {
    title: 'GEMASTIK, Software Development (Divisi VIII)',
    detail: {
      en: 'National student ICT competition',
      id: 'Kompetisi TIK mahasiswa tingkat nasional',
    },
    status: { en: 'in preparation', id: 'sedang dipersiapkan' },
    open: true,
    year: '2026',
  },
  {
    title: 'Taekwondo, sabuk merah strip 2',
    detail: {
      en: 'Provincial to national competition experience',
      id: 'Pengalaman kompetisi tingkat provinsi hingga nasional',
    },
    status: { en: 'achieved', id: 'tercapai' },
    open: false,
    year: '2024',
  },
];

/* Narrow a { en, id } record, or pass through a value that is the same in both. */
export function pick<T>(value: Localisable<T>, lang: Lang): T {
  if (value !== null && typeof value === 'object' && !Array.isArray(value) && lang in value) {
    return (value as Record<Lang, T>)[lang];
  }
  return value as T;
}
