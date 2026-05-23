/**
 * Brasse-Bouillon feedback widget loader.
 *
 * Single source for the "Report" widget, referenced by every page so its
 * config lives in one place (no duplicated inline snippet to keep in sync).
 *
 * It loads the Cloudflare Worker widget bundle ONLY on the production domain:
 * the Worker's CORS allow-list is prod-only, so on localhost / previews the
 * submit flow would break and the third-party request would be pointless.
 * The dynamic import keeps the worker bundle off non-prod pages entirely.
 */
const PROD_HOSTS = ['brasse-bouillon.com', 'www.brasse-bouillon.com'];
const WIDGET_SRC =
  'https://feedback-pipeline-worker.bbd-concept.workers.dev/widget.js';
const ENDPOINT =
  'https://feedback-pipeline-worker.bbd-concept.workers.dev/ingest';

if (PROD_HOSTS.includes(window.location.hostname)) {
  import(WIDGET_SRC)
    .then(({ mountFeedbackWidget }) => {
      mountFeedbackWidget({ projectId: 'brasse-bouillon', endpoint: ENDPOINT });
    })
    .catch(() => {
      /* The widget is non-critical UI; ignore load/network failures. */
    });
}
