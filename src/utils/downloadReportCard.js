import { BASE_URL, getAccessToken } from '../api/client';

// The report-card PDF endpoint requires the same Bearer-token auth as any
// other API call, so a plain <a href> link won't work — the browser
// wouldn't attach the Authorization header. Fetch it as a blob instead
// and trigger the download manually.
export async function downloadReportCard(resultId, filenameHint = 'report-card') {
  const res = await fetch(`${BASE_URL}/results/${resultId}/report-card`, {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to download the report card. Please try again.');
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filenameHint}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
