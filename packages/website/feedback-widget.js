/**
 * Brasse-Bouillon feedback widget loader.
 *
 * Single source for the "Report" widget, referenced by every page so its
 * config lives in one place (no duplicated inline snippet to keep in sync).
 *
 * The feedback widget is a DEVELOPMENT tool, not a production feature: it loads
 * the Cloudflare Worker widget bundle ONLY on the staging environment (and on
 * localhost for local review), never on the public production site. This keeps
 * the "Report" UI and the third-party Worker request off brasse-bouillon.com
 * entirely. The Worker's CORS allow-list must include each host below for the
 * submit flow to succeed.
 */
const WIDGET_HOSTS = [
  'staging.brasse-bouillon-website.pages.dev',
  'localhost',
  '127.0.0.1',
];
const WIDGET_SRC =
  'https://feedback-pipeline-worker.bbd-concept.workers.dev/widget.js';
const ENDPOINT =
  'https://feedback-pipeline-worker.bbd-concept.workers.dev/ingest';

if (WIDGET_HOSTS.includes(window.location.hostname)) {
  import(WIDGET_SRC)
    .then(({ mountFeedbackWidget }) => {
      mountFeedbackWidget({ projectId: 'brasse-bouillon', endpoint: ENDPOINT });
    })
    .catch(() => {
      /* The widget is non-critical UI; ignore load/network failures. */
    });
}
