import { defaultLang, ui, type Lang, type UIKey } from './ui';

export function getLangFromUrl(url: URL): Lang {
  const [, first] = url.pathname.split('/');
  return first in ui ? (first as Lang) : defaultLang;
}

/*
  Values are interpolated as {name}, so a translator can move them around the
  sentence — Indonesian and English do not order these the same way.
*/
export function useTranslations(lang: Lang) {
  return function t(key: UIKey, values: Record<string, string | number> = {}): string {
    const template: string = ui[lang][key] ?? ui[defaultLang][key];
    return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
      name in values ? String(values[name]) : whole,
    );
  };
}

/* English lives at the root, Indonesian under /id/. */
export function localise(path: string, lang: Lang): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return lang === defaultLang ? clean : `/${lang}${clean}`;
}

/* The same page in the other language, for the switcher. */
export function alternatePath(url: URL, target: Lang): string {
  const current = getLangFromUrl(url);
  const bare =
    current === defaultLang ? url.pathname : url.pathname.replace(`/${current}`, '') || '/';
  return localise(bare, target);
}

/* Collection entry ids are `<lang>/<slug>`. */
export function entryLang(id: string): Lang {
  const [first] = id.split('/');
  return first in ui ? (first as Lang) : defaultLang;
}

export function entrySlug(id: string): string {
  const parts = id.split('/');
  return parts.length > 1 ? parts.slice(1).join('/') : id;
}
