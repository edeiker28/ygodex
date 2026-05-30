import type { Deck, DeckCard } from '../types/ygo';

function cardRow(dc: DeckCard, copies: number): string {
  const img = dc.card.card_images[0]?.image_url_small ?? '';
  return `<div style="display:inline-block;margin:3px;vertical-align:top;">
    <img src="${img}" width="60" height="87" style="display:block;border-radius:4px;border:1px solid #888;" />
    ${copies > 1 ? `<div style="text-align:center;font-size:9px;color:#555;margin-top:2px;">×${copies}</div>` : ''}
  </div>`;
}

function zoneHtml(label: string, cards: DeckCard[], total: number, max: number): string {
  if (cards.length === 0) return '';
  const grid = cards.map(dc => cardRow(dc, dc.count)).join('');
  return `
    <div style="margin-bottom:18px;">
      <h3 style="font-family:sans-serif;font-size:12px;color:#444;margin:0 0 6px 0;border-bottom:1px solid #ddd;padding-bottom:4px;">
        ${label} — ${total}/${max}
      </h3>
      <div>${grid}</div>
    </div>`;
}

export function printDeckPdf(deck: Deck): void {
  const mainTotal = deck.main.reduce((s, dc) => s + dc.count, 0);
  const extraTotal = deck.extra.reduce((s, dc) => s + dc.count, 0);
  const sideTotal = deck.side.reduce((s, dc) => s + dc.count, 0);
  const date = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

  // Unique cards for the name list
  const listMain = deck.main.map(dc => `${dc.count}x ${dc.card.name}`).join('<br>');
  const listExtra = deck.extra.map(dc => `${dc.count}x ${dc.card.name}`).join('<br>');
  const listSide = deck.side.map(dc => `${dc.count}x ${dc.card.name}`).join('<br>');

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${deck.name} — YGODEX</title>
  <style>
    @page { size: A4; margin: 12mm 10mm; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #222; background: #fff; margin: 0; padding: 0; }
    h1 { font-size: 20px; margin: 0 0 2px 0; }
    .subtitle { font-size: 11px; color: #666; margin-bottom: 16px; }
    h3 { font-size: 12px; color: #333; margin: 0 0 5px 0; border-bottom: 1px solid #e0e0e0; padding-bottom: 3px; }
    .section { margin-bottom: 14px; }
    .grid img { border-radius: 3px; }
    .list { font-size: 10px; line-height: 1.7; color: #333; }
    .cols { display: flex; gap: 20px; margin-top: 14px; }
    .col { flex: 1; }
    .stat-row { display:flex; gap:20px; font-size:11px; color:#555; margin-bottom:10px; }
    .stat { background:#f5f5f5; border-radius:4px; padding:4px 10px; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <h1>${deck.name}</h1>
  <div class="subtitle">Exportado desde YGODEX · ${date}</div>

  <div class="stat-row">
    <span class="stat">Main Deck: <b>${mainTotal}</b></span>
    <span class="stat">Extra Deck: <b>${extraTotal}</b></span>
    <span class="stat">Side Deck: <b>${sideTotal}</b></span>
    <span class="stat">Total: <b>${mainTotal + extraTotal + sideTotal}</b></span>
  </div>

  <!-- Images -->
  <div class="section">
    ${zoneHtml('Main Deck', deck.main, mainTotal, 60)}
    ${zoneHtml('Extra Deck', deck.extra, extraTotal, 15)}
    ${zoneHtml('Side Deck', deck.side, sideTotal, 15)}
  </div>

  <!-- Card list columns -->
  <div class="cols">
    <div class="col">
      <h3>Main Deck (${mainTotal})</h3>
      <div class="list">${listMain || '—'}</div>
    </div>
    ${extraTotal > 0 ? `<div class="col">
      <h3>Extra Deck (${extraTotal})</h3>
      <div class="list">${listExtra}</div>
    </div>` : ''}
    ${sideTotal > 0 ? `<div class="col">
      <h3>Side Deck (${sideTotal})</h3>
      <div class="list">${listSide}</div>
    </div>` : ''}
  </div>

  <script>
    window.onload = function() {
      // Give images time to load before printing
      var imgs = document.images;
      var loaded = 0;
      if (imgs.length === 0) { window.print(); return; }
      function tryPrint() { loaded++; if (loaded >= imgs.length) window.print(); }
      for (var i = 0; i < imgs.length; i++) {
        if (imgs[i].complete) { tryPrint(); }
        else { imgs[i].onload = tryPrint; imgs[i].onerror = tryPrint; }
      }
    };
  </script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) return;
  win.document.open();
  win.document.write(html);
  win.document.close();
}
