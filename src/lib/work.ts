import { getCollection, type CollectionEntry } from 'astro:content';

export type Work = CollectionEntry<'work'>;

export interface Source {
  /** Citation number, 1-based, in home-page order. */
  n: number;
  id: string;
  title: string;
  href: string;
}

/** Published case studies in home-page order. Their position is their citation number. */
export async function getWork(): Promise<Work[]> {
  const work = await getCollection('work', ({ data }) => !data.draft);
  return work.sort((a, b) => a.data.order - b.data.order);
}

export function toSources(work: Work[]): Map<string, Source> {
  return new Map(
    work.map((entry, i) => [
      entry.id,
      { n: i + 1, id: entry.id, title: entry.data.title, href: `/work/${entry.id}/` },
    ])
  );
}

export interface Passage {
  /** Citation label: a case-study number, or "S" for the story on the home page. */
  n: number | string;
  href: string;
  title: string;
  section: string;
  text: string;
}

const plain = (md: string) =>
  md
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/(\*\*|__)(.+?)\1/g, '$2') // bold
    .replace(/(\*|_)(.+?)\1/g, '$2') // emphasis
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

/** Splits every case study into quotable passages for the in-browser "ask" box. */
export function toPassages(work: Work[]): Passage[] {
  const sources = toSources(work);
  const passages: Passage[] = [];

  for (const entry of work) {
    const { n, href, title } = sources.get(entry.id)!;
    const add = (section: string, text: string) => {
      const clean = plain(text);
      if (clean) passages.push({ n, href, title, section, text: clean });
    };

    add('Summary', entry.data.outcome);
    add('Stack', `Built with ${entry.data.stack.join(', ')}.`);

    let section = 'Overview';
    for (const block of (entry.body ?? '').split(/\n\s*\n/)) {
      const lines = block.trim().split('\n');
      if (lines[0]?.startsWith('## ')) {
        section = lines[0].slice(3).trim();
        lines.shift();
      }
      if (lines.every((line) => line.startsWith('- '))) {
        for (const line of lines) add(section, line.slice(2));
      } else if (lines.length) {
        add(section, lines.join(' '));
      }
    }
  }

  // Facts from the story on the home page, so questions about me have a source too.
  const story: [string, string, string][] = [
    ['/#top', 'Noise', 'I am Rourke Paslovsky, an AI engineer at GAS Marketing in Johannesburg, South Africa.'],
    [
      '/#signal',
      'Signal',
      'I joined GAS Marketing as an account manager intern, to get work experience while I studied. They noticed the interest and the data skills, and moved me into a new role: AI engineer.',
    ],
    [
      '/#distance',
      'Distance',
      "I'm completing an MSc in Business Analytics at Edinburgh Business School, online from Johannesburg, while working as an AI engineer.",
    ],
    [
      '/#roots',
      'Roots',
      'Outside the work: chess, bonsai and house plants, and calisthenics. Three slow disciplines that reward small, deliberate moves that compound.',
    ],
    ['/#contact', 'Now', 'The fastest way to reach me is email, at rourke.paslovsky3@gmail.com, or connect on LinkedIn.'],
  ];
  for (const [href, section, text] of story) {
    passages.push({ n: 'S', href, title: 'My story', section, text });
  }

  return passages;
}
