export interface YdkParsed {
  main: number[];
  extra: number[];
  side: number[];
}

export function parseYdk(text: string): YdkParsed {
  const result: YdkParsed = { main: [], extra: [], side: [] };
  let section: keyof YdkParsed | null = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#created') || line.startsWith('#')) {
      if (line === '#main') { section = 'main'; continue; }
      if (line === '#extra') { section = 'extra'; continue; }
      if (line === '#side' || line === '!side') { section = 'side'; continue; }
      continue;
    }
    if (line === '!side') { section = 'side'; continue; }

    const id = parseInt(line, 10);
    if (!isNaN(id) && id > 0 && section) {
      result[section].push(id);
    }
  }

  return result;
}
