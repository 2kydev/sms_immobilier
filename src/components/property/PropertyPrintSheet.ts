/**
 * Opens a print-ready property sheet in a new window and triggers the browser print dialog.
 * The user can then save as PDF or print physically.
 */
export function printPropertySheet(property: any): void {
  const images: string[] = property.images || [];
  const firstImage = images[0] ?? null;

  const formatPrice = (n: number) =>
    n ? n.toLocaleString('fr-FR') + ' F CFA' : '—';

  const formatSurface = (surface: number, autresDetails: string | null) => {
    if (!surface) return '—';
    try {
      const details = autresDetails ? JSON.parse(autresDetails) : {};
      if (details.surface_unit === 'ha') return `${(surface / 10000).toLocaleString()} ha`;
    } catch {}
    return `${surface.toLocaleString()} m²`;
  };

  const txLabel = property.transaction_type === 'vente' ? 'Vente' : 'Location';
  const statusLabels: Record<string, string> = {
    disponible: 'Disponible', 'sous-offre': 'Sous offre',
    vendu: 'Vendu', loue: 'Loué', archivé: 'Archivé',
  };
  const statusLabel = statusLabels[property.statut] ?? property.statut;

  const features: string[] = (() => {
    const c = property.caracteristiques;
    if (!c) return [];
    if (Array.isArray(c)) return c;
    try { return JSON.parse(c); } catch { return []; }
  })();

  const boolFeatures = [
    property.piscine && 'Piscine',
    property.jardin && 'Jardin',
    property.cuisine_independante && 'Cuisine indépendante',
    property.adu && 'ADU',
    property.acd && 'ACD',
    property.attestation_villagoise && 'Attestation villagoise',
    property.autres_documents && 'Autres documents',
  ].filter(Boolean) as string[];

  const allFeatures = [...features, ...boolFeatures];

  const today = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<title>Fiche bien — ${property.titre}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; background: #fff; font-size: 13px; }
  @page { size: A4; margin: 15mm 15mm 20mm 15mm; }

  /* Header */
  .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #1e3a5f; padding-bottom: 12px; margin-bottom: 20px; }
  .header-agency { font-size: 22px; font-weight: 800; color: #1e3a5f; letter-spacing: -0.5px; }
  .header-sub { font-size: 11px; color: #666; margin-top: 2px; }
  .header-date { text-align: right; font-size: 11px; color: #666; }

  /* Title block */
  .title-block { margin-bottom: 18px; }
  .title-block h1 { font-size: 20px; font-weight: 700; color: #1e3a5f; line-height: 1.2; }
  .badges { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
  .badge-tx { background: #1e3a5f; color: #fff; }
  .badge-status { background: #e8f5e9; color: #2e7d32; }
  .badge-type { background: #f3f4f6; color: #374151; }

  /* Main grid */
  .main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }

  /* Photo */
  .photo-block { grid-column: 1; }
  .photo-block img { width: 100%; height: 220px; object-fit: cover; border-radius: 6px; border: 1px solid #e5e7eb; }
  .no-photo { width: 100%; height: 220px; background: #f3f4f6; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 12px; border: 1px solid #e5e7eb; }

  /* Key metrics */
  .metrics-block { display: flex; flex-direction: column; gap: 10px; }
  .metric-row { background: #f8fafc; border-radius: 6px; padding: 10px 14px; border-left: 3px solid #1e3a5f; }
  .metric-label { font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
  .metric-value { font-size: 16px; font-weight: 700; color: #1e3a5f; }
  .metric-price { font-size: 20px; font-weight: 800; color: #d97706; }

  /* Location */
  .location { display: flex; align-items: flex-start; gap: 6px; margin-bottom: 16px; padding: 10px 14px; background: #f8fafc; border-radius: 6px; }
  .location-icon { color: #6b7280; font-size: 14px; margin-top: 1px; }
  .location-text { font-size: 13px; color: #374151; }

  /* Section */
  .section { margin-bottom: 16px; }
  .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #6b7280; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #e5e7eb; }
  .description { font-size: 12px; line-height: 1.7; color: #374151; }

  /* Features */
  .features { display: flex; flex-wrap: wrap; gap: 6px; }
  .feature-tag { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; }

  /* Details table */
  .details-table { width: 100%; border-collapse: collapse; }
  .details-table td { padding: 5px 8px; font-size: 12px; border-bottom: 1px solid #f3f4f6; }
  .details-table td:first-child { color: #6b7280; font-weight: 500; width: 50%; }
  .details-table td:last-child { color: #111827; font-weight: 600; }

  /* Footer */
  .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
  .footer-agent { font-size: 12px; color: #374151; }
  .footer-agent strong { color: #1e3a5f; }
  .footer-note { font-size: 10px; color: #9ca3af; }

  @media print {
    .no-print { display: none !important; }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>

<!-- Print button (hidden on print) -->
<div class="no-print" style="position:fixed;top:16px;right:16px;z-index:999">
  <button onclick="window.print()" style="background:#1e3a5f;color:#fff;border:none;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;">
    🖨️ Imprimer / Sauvegarder PDF
  </button>
</div>

<div style="max-width:780px;margin:0 auto;padding:20px;">

  <!-- Header -->
  <div class="header">
    <div>
      <div class="header-agency">SMS Immobilier</div>
      <div class="header-sub">Agence immobilière professionnelle</div>
    </div>
    <div class="header-date">
      <div>Fiche de bien</div>
      <div style="font-weight:600;color:#1e3a5f;">${today}</div>
    </div>
  </div>

  <!-- Title -->
  <div class="title-block">
    <h1>${property.titre}</h1>
    <div class="badges">
      <span class="badge badge-tx">${txLabel}</span>
      <span class="badge badge-status">${statusLabel}</span>
      <span class="badge badge-type">${property.type ?? '—'}</span>
    </div>
  </div>

  <!-- Location -->
  <div class="location">
    <span class="location-icon">📍</span>
    <span class="location-text">${property.adresse ?? ''}, ${property.quartier ?? ''}, ${property.city ?? ''}</span>
  </div>

  <!-- Main grid: photo + key metrics -->
  <div class="main-grid">
    <div class="photo-block">
      ${firstImage
        ? `<img src="${firstImage}" alt="${property.titre}" />`
        : `<div class="no-photo">Aucune photo disponible</div>`}
    </div>
    <div class="metrics-block">
      <div class="metric-row">
        <div class="metric-label">Prix</div>
        <div class="metric-price">${formatPrice(property.prix)}</div>
      </div>
      <div class="metric-row">
        <div class="metric-label">Surface</div>
        <div class="metric-value">${formatSurface(property.surface, property.autres_details)}</div>
      </div>
      <div class="metric-row">
        <div class="metric-label">Pièces</div>
        <div class="metric-value">${property.pieces ?? '—'}</div>
      </div>
      ${property.nombre_salles_eau ? `
      <div class="metric-row">
        <div class="metric-label">Salles d'eau</div>
        <div class="metric-value">${property.nombre_salles_eau}</div>
      </div>` : ''}
      ${property.charges ? `
      <div class="metric-row">
        <div class="metric-label">Charges</div>
        <div class="metric-value">${formatPrice(property.charges)}</div>
      </div>` : ''}
    </div>
  </div>

  <!-- Description -->
  ${property.description ? `
  <div class="section">
    <div class="section-title">Description</div>
    <div class="description">${property.description.replace(/\n/g, '<br/>')}</div>
  </div>` : ''}

  <!-- Features -->
  ${allFeatures.length > 0 ? `
  <div class="section">
    <div class="section-title">Caractéristiques</div>
    <div class="features">
      ${allFeatures.map(f => `<span class="feature-tag">${f}</span>`).join('')}
    </div>
  </div>` : ''}

  <!-- Documents / Titres fonciers -->
  ${(property.acd || property.adu || property.attestation_villagoise || property.extrait_topographique) ? `
  <div class="section">
    <div class="section-title">Documents disponibles</div>
    <div class="features">
      ${property.acd ? '<span class="feature-tag">ACD</span>' : ''}
      ${property.adu ? '<span class="feature-tag">ADU</span>' : ''}
      ${property.attestation_villagoise ? '<span class="feature-tag">Attestation villagoise</span>' : ''}
      ${property.extrait_topographique ? '<span class="feature-tag">Extrait topographique</span>' : ''}
      ${property.autres_documents ? '<span class="feature-tag">Autres documents</span>' : ''}
    </div>
  </div>` : ''}

  <!-- Details table -->
  <div class="section">
    <div class="section-title">Informations complémentaires</div>
    <table class="details-table">
      <tr><td>Référence</td><td>${property.id?.substring(0, 8).toUpperCase() ?? '—'}</td></tr>
      <tr><td>Type de transaction</td><td>${txLabel}</td></tr>
      <tr><td>Statut</td><td>${statusLabel}</td></tr>
      <tr><td>Source</td><td>${property.source ?? '—'}</td></tr>
      ${property.nom_proprietaire ? `<tr><td>Propriétaire</td><td>${property.nom_proprietaire}</td></tr>` : ''}
      <tr><td>Agent responsable</td><td>${property.agent ?? '—'}</td></tr>
    </table>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-agent">
      Agent : <strong>${property.agent ?? '—'}</strong>
      ${property.contacts_proprietaire ? ` · Contact : ${property.contacts_proprietaire}` : ''}
    </div>
    <div class="footer-note">Document généré le ${today} · SMS Immobilier</div>
  </div>

</div>

<script>
  // Auto-trigger print after images load
  window.addEventListener('load', function() {
    // Small delay to ensure styles are applied
    setTimeout(function() { /* ready */ }, 500);
  });
</script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) return;
  win.document.write(html);
  win.document.close();
}
