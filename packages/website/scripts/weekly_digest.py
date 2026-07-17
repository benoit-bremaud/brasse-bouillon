#!/usr/bin/env python3
"""Generate a weekly product digest from merged backend/frontend PRs.

Outputs (in ``docs/weekly`` by default):
- latest-audit.json (machine-readable classification)
- latest-report.md (human review report)
- latest-social-drafts.md (ready-to-review social drafts)

The script is dependency-free and can run locally or in GitHub Actions.
"""

from __future__ import annotations

import argparse
import json
import os
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib import error, parse, request


ROOT = Path(__file__).resolve().parent.parent
DEFAULT_FEED_PATH = ROOT / "docs" / "roadmap-feed.json"
DEFAULT_OUTPUT_DIR = ROOT / "docs" / "weekly"
DEFAULT_REPOS = [
    "benoit-bremaud/brasse-bouillon-frontend",
    "benoit-bremaud/brasse-bouillon-backend",
]
GITHUB_API_BASE = "https://api.github.com"
ALLOWED_GITHUB_API_HOSTS = {"api.github.com"}

TECHNICAL_TITLE_PREFIXES = (
    "ci(",
    "chore(",
    "docs(",
    "test(",
    "build(",
)

TECHNICAL_TITLE_HINTS = (
    "sonar",
    "workflow",
    "coverage",
    "readme",
    "logger",
    "lint",
)

USER_TITLE_HINTS = (
    "feat(",
    "fix(",
    "navigation",
    "ingredient",
    "malt",
    "hop",
    "yeast",
    "recipe",
    "batch",
    "auth",
    "security",
    "footer",
    "header",
    "shop",
    "ibu",
    "tinseth",
)


@dataclass(frozen=True)
class PullRequestRecord:
    repo: str
    number: int
    title: str
    merged_at: str
    url: str
    files: list[str]
    user_facing: bool
    reason: str

    @property
    def repo_short(self) -> str:
        return self.repo.split("/")[-1].replace("brasse-bouillon-", "")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate weekly PR digest and social drafts"
    )
    parser.add_argument(
        "--feed-path",
        default=str(DEFAULT_FEED_PATH),
        help="Roadmap feed path used to infer default --since",
    )
    parser.add_argument(
        "--output-dir",
        default=str(DEFAULT_OUTPUT_DIR),
        help="Output directory for generated digest files",
    )
    parser.add_argument(
        "--since",
        default="",
        help="Lower bound merged_at ISO-8601 (defaults to latest roadmap-feed entry)",
    )
    parser.add_argument(
        "--repo",
        action="append",
        dest="repos",
        default=[],
        help="Repository owner/name to scan (repeatable)",
    )
    parser.add_argument(
        "--token",
        default="",
        help="GitHub token (defaults to GH_TOKEN/GITHUB_TOKEN env)",
    )
    parser.add_argument(
        "--max-prs",
        type=int,
        default=100,
        help="Maximum number of merged PRs to inspect per repository",
    )
    return parser.parse_args()


def now_iso() -> str:
    return (
        datetime.now(timezone.utc)
        .replace(microsecond=0)
        .isoformat()
        .replace("+00:00", "Z")
    )


def normalize_iso_datetime(value: str) -> str:
    raw = value.strip()
    if not raw:
        raise ValueError("ISO datetime value cannot be empty")

    normalized = raw.replace("Z", "+00:00") if raw.endswith("Z") else raw
    dt = datetime.fromisoformat(normalized)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)

    return (
        dt.astimezone(timezone.utc)
        .replace(microsecond=0)
        .isoformat()
        .replace("+00:00", "Z")
    )


def infer_since_from_feed(feed_path: Path) -> str:
    if not feed_path.exists():
        return "1970-01-01T00:00:00Z"

    data = json.loads(feed_path.read_text(encoding="utf-8"))
    entries = data.get("entries", [])
    if not isinstance(entries, list) or not entries:
        return "1970-01-01T00:00:00Z"

    merged_at = str(entries[0].get("merged_at", "")).strip()
    if not merged_at:
        return "1970-01-01T00:00:00Z"

    return normalize_iso_datetime(merged_at)


def parse_link_header(raw_link_header: str) -> dict[str, str]:
    links: dict[str, str] = {}
    for item in raw_link_header.split(","):
        part = item.strip()
        if not part or ";" not in part:
            continue
        url_part, *params = part.split(";")
        url = url_part.strip().lstrip("<").rstrip(">")
        rel_value = ""
        for param in params:
            key, _, value = param.strip().partition("=")
            if key == "rel":
                rel_value = value.strip().strip('"')
                break
        if rel_value and url:
            links[rel_value] = url
    return links


def ensure_allowed_api_url(url: str) -> None:
    parsed = parse.urlparse(url)
    if parsed.scheme != "https":
        raise ValueError(f"Unsupported URL scheme for GitHub API call: {parsed.scheme}")
    if parsed.netloc not in ALLOWED_GITHUB_API_HOSTS:
        raise ValueError(f"Unexpected GitHub API host in URL: {parsed.netloc}")
    if not parsed.path.startswith("/"):
        raise ValueError("Invalid GitHub API URL path")


def github_get_json(url: str, token: str) -> tuple[Any, dict[str, str]]:
    ensure_allowed_api_url(url)

    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "brasse-bouillon-weekly-digest",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"

    req = request.Request(url, headers=headers)
    try:
        with request.urlopen(req, timeout=30) as response:
            payload = json.loads(response.read().decode("utf-8"))
            response_headers = {key: value for key, value in response.headers.items()}
            return payload, response_headers
    except error.HTTPError as exc:  # pragma: no cover - network error path
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"GitHub API error {exc.code} for {url}: {detail}") from exc


def paginated_get(url: str, token: str) -> list[Any]:
    items: list[Any] = []
    next_url = url
    while next_url:
        payload, headers = github_get_json(next_url, token)
        if not isinstance(payload, list):
            raise ValueError(
                f"Expected list payload from GitHub API, got {type(payload)}"
            )
        items.extend(payload)
        links = parse_link_header(headers.get("Link", ""))
        next_url = links.get("next", "")
    return items


def fetch_merged_prs(
    repo: str,
    since_iso: str,
    token: str,
    max_prs: int,
) -> list[dict[str, Any]]:
    query = parse.urlencode(
        {
            "state": "closed",
            "base": "main",
            "sort": "updated",
            "direction": "desc",
            "per_page": "100",
        }
    )
    url = f"{GITHUB_API_BASE}/repos/{repo}/pulls?{query}"
    raw_prs = paginated_get(url, token)

    merged: list[dict[str, Any]] = []
    for item in raw_prs:
        merged_at = str(item.get("merged_at") or "").strip()
        if not merged_at:
            continue
        normalized_merged_at = normalize_iso_datetime(merged_at)
        if normalized_merged_at <= since_iso:
            continue

        merged.append(
            {
                "number": int(item["number"]),
                "title": str(item.get("title") or "").strip(),
                "merged_at": normalized_merged_at,
                "url": str(item.get("html_url") or "").strip(),
            }
        )

    merged.sort(key=lambda pr: pr["merged_at"])

    if max_prs > 0 and len(merged) > max_prs:
        return merged[-max_prs:]

    return merged


def fetch_pr_files(repo: str, pr_number: int, token: str) -> list[str]:
    query = parse.urlencode({"per_page": "100"})
    url = f"{GITHUB_API_BASE}/repos/{repo}/pulls/{pr_number}/files?{query}"
    raw_files = paginated_get(url, token)
    files: list[str] = []
    for item in raw_files:
        filename = str(item.get("filename") or "").strip()
        if filename:
            files.append(filename)
    return files


def is_product_path(repo: str, file_path: str) -> bool:
    normalized = file_path.strip()
    if not normalized:
        return False

    repo_name = repo.split("/")[-1]
    if repo_name.endswith("frontend"):
        return normalized.startswith(("src/features/", "app/(app)/", "src/core/ui/"))

    if repo_name.endswith("backend"):
        if not normalized.startswith("src/"):
            return False
        if normalized.endswith(".spec.ts"):
            return False
        return True

    return normalized.startswith("src/")


def classify_pr(repo: str, title: str, files: list[str]) -> tuple[bool, str]:
    lower_title = title.lower().strip()

    if lower_title.startswith(TECHNICAL_TITLE_PREFIXES):
        return False, "technical-title-prefix"

    if lower_title.startswith("refactor(") and any(
        hint in lower_title for hint in TECHNICAL_TITLE_HINTS
    ):
        return False, "technical-refactor"

    has_product_file = any(is_product_path(repo, path) for path in files)
    if has_product_file:
        return True, "product-code-change"

    if any(hint in lower_title for hint in TECHNICAL_TITLE_HINTS):
        return False, "technical-title-hint"

    if any(hint in lower_title for hint in USER_TITLE_HINTS):
        return True, "user-facing-title-hint"

    return False, "default-technical"


def collect_pr_records(
    repos: list[str],
    since_iso: str,
    token: str,
    max_prs: int,
) -> list[PullRequestRecord]:
    records: list[PullRequestRecord] = []
    for repo in repos:
        merged_prs = fetch_merged_prs(
            repo=repo, since_iso=since_iso, token=token, max_prs=max_prs
        )
        for merged_pr in merged_prs:
            files = fetch_pr_files(
                repo=repo, pr_number=merged_pr["number"], token=token
            )
            user_facing, reason = classify_pr(
                repo=repo,
                title=merged_pr["title"],
                files=files,
            )
            records.append(
                PullRequestRecord(
                    repo=repo,
                    number=merged_pr["number"],
                    title=merged_pr["title"],
                    merged_at=merged_pr["merged_at"],
                    url=merged_pr["url"],
                    files=files,
                    user_facing=user_facing,
                    reason=reason,
                )
            )

    records.sort(key=lambda item: item.merged_at)
    return records


def should_publish_now(user_facing_prs: list[PullRequestRecord]) -> bool:
    return len(user_facing_prs) >= 3


def build_theme_flags(user_facing_prs: list[PullRequestRecord]) -> dict[str, bool]:
    flags = {
        "ingredients": False,
        "navigation": False,
        "security": False,
        "batch": False,
        "ibu": False,
    }

    for pr in user_facing_prs:
        title = pr.title.lower()
        if any(token in title for token in ("malt", "hop", "yeast", "ingredient")):
            flags["ingredients"] = True
        if any(token in title for token in ("navigation", "footer", "header", "back")):
            flags["navigation"] = True
        if any(token in title for token in ("auth", "security", "rate limit", "jwt")):
            flags["security"] = True
        if "batch" in title:
            flags["batch"] = True
        if any(token in title for token in ("ibu", "tinseth")):
            flags["ibu"] = True

    return flags


def select_highlights(user_facing_prs: list[PullRequestRecord]) -> list[str]:
    if not user_facing_prs:
        return []

    theme_flags = build_theme_flags(user_facing_prs)
    highlights: list[str] = []

    if theme_flags["ingredients"]:
        highlights.append(
            "Ingredient experience expanded (malt filters, hop/yeast detail pages, and contextual navigation)."
        )
    if theme_flags["navigation"]:
        highlights.append(
            "Navigation reliability improved across ingredients, recipes, batches, and shop flows."
        )
    if theme_flags["security"]:
        highlights.append(
            "Authentication security hardening delivered (throttling on login/register endpoints)."
        )
    if theme_flags["batch"]:
        highlights.append(
            "Batch lifecycle improved with owner-scoped deletion support."
        )
    if theme_flags["ibu"]:
        highlights.append(
            "Brewing calculations expanded with a Tinseth IBU estimation endpoint."
        )

    if not highlights:
        highlights.append(
            "Multiple user-facing improvements were merged and are ready to communicate."
        )

    return highlights[:5]


def render_report_markdown(
    *,
    generated_at: str,
    since_iso: str,
    records: list[PullRequestRecord],
) -> str:
    user_facing = [record for record in records if record.user_facing]
    technical = [record for record in records if not record.user_facing]
    publish_now = should_publish_now(user_facing)
    highlights = select_highlights(user_facing)

    lines = [
        "# Weekly Product Digest",
        "",
        f"- Generated at: `{generated_at}`",
        f"- Since: `{since_iso}`",
        f"- Total merged PRs analyzed: **{len(records)}**",
        f"- User-facing PRs: **{len(user_facing)}**",
        f"- Technical/internal PRs: **{len(technical)}**",
        f"- Publish recommendation: **{'Publish now' if publish_now else 'Wait for more signal'}**",
        "",
        "## Suggested highlights",
    ]

    if highlights:
        lines.extend([f"- {highlight}" for highlight in highlights])
    else:
        lines.append("- No strong user-facing highlight detected in this window.")

    lines.extend(
        [
            "",
            "## User-facing PRs",
            "",
            "| Repo | PR | Merged at | Title |",
            "| ---- | -- | --------- | ----- |",
        ]
    )

    if user_facing:
        for pr in user_facing:
            lines.append(
                f"| {pr.repo_short} | [#{pr.number}]({pr.url}) | {pr.merged_at} | {pr.title} |"
            )
    else:
        lines.append("| - | - | - | No user-facing PR in this window |")

    lines.extend(
        [
            "",
            "## Technical/internal PRs (excluded from public changelog)",
            "",
            "| Repo | PR | Merged at | Title | Reason |",
            "| ---- | -- | --------- | ----- | ------ |",
        ]
    )

    if technical:
        for pr in technical:
            lines.append(
                f"| {pr.repo_short} | [#{pr.number}]({pr.url}) | {pr.merged_at} | {pr.title} | {pr.reason} |"
            )
    else:
        lines.append("| - | - | - | - | None |")

    return "\n".join(lines) + "\n"


def render_social_drafts_markdown(
    *,
    generated_at: str,
    since_iso: str,
    records: list[PullRequestRecord],
) -> str:
    user_facing = [record for record in records if record.user_facing]
    highlights = select_highlights(user_facing)
    theme_flags = build_theme_flags(user_facing)

    fr_bullet_map = [
        (
            "navigation",
            "Navigation app renforcée (header/footer/back, retours plus déterministes).",
        ),
        (
            "ingredients",
            "Expérience ingrédients enrichie (filtres malts + fiches houblons/levures + navigation contextuelle).",
        ),
        (
            "batch",
            "Parcours brassins amélioré (suppression d’un lot côté propriétaire).",
        ),
        (
            "security",
            "Sécurité auth renforcée (throttling sur login/register).",
        ),
        (
            "ibu",
            "Calcul brassage enrichi avec l’estimation IBU Tinseth côté API.",
        ),
    ]
    en_bullet_map = [
        (
            "navigation",
            "Better navigation reliability across key app screens",
        ),
        (
            "ingredients",
            "Expanded ingredient flows (malt filters + hop/yeast detail pages)",
        ),
        (
            "batch",
            "Batch lifecycle improved with owner-scoped deletion",
        ),
        (
            "security",
            "Auth hardening delivered with login/register throttling",
        ),
        (
            "ibu",
            "Brewing API expanded with Tinseth IBU estimation",
        ),
    ]

    fr_bullets = [text for key, text in fr_bullet_map if theme_flags[key]]
    en_bullets = [text for key, text in en_bullet_map if theme_flags[key]]

    if user_facing and not fr_bullets:
        fr_bullets = [
            "Plusieurs améliorations user-facing ont été livrées cette semaine."
        ]
    if user_facing and not en_bullets:
        en_bullets = ["Multiple user-facing improvements were delivered this week"]

    if not user_facing:
        fr_bullets = [
            "Aucune livraison user-facing significative cette semaine (focus technique/interne)."
        ]
        en_bullets = [
            "No significant user-facing delivery this week (technical/internal focus)"
        ]

    instagram_summary = " ".join(fr_bullets[:2])

    lines = [
        "# Weekly Social Drafts",
        "",
        f"- Generated at: `{generated_at}`",
        f"- Since: `{since_iso}`",
        "",
        "## LinkedIn draft (FR)",
        "",
        "🚀 Point d'avancement produit Brasse-Bouillon",
        "",
        "Cette semaine, plusieurs évolutions concrètes ont été livrées côté frontend/backend :",
    ]
    lines.extend([f"- {bullet}" for bullet in fr_bullets])
    lines.extend(
        [
            "",
            "On continue à synchroniser la roadmap publique avec les livraisons réellement mergées sur `main`.",
            "",
            "#BrasseBouillon #ProductUpdate #Homebrewing #CraftBeer #BuildInPublic",
            "",
            "## Instagram caption draft (FR)",
            "",
            "🍻 Update produit de la semaine chez Brasse-Bouillon",
            instagram_summary,
            "",
            "👉 La roadmap publique continue d’être synchronisée avec les vraies livraisons.",
            "",
            "#homebrewing #craftbeer #appupdate #buildinpublic",
            "",
            "## X/Twitter draft (EN)",
            "",
            "Weekly product update 🍺",
        ]
    )
    lines.extend([f"- {bullet}" for bullet in en_bullets])
    lines.extend(
        [
            "",
            "Roadmap sync remains traceable from merged PRs. #buildinpublic #homebrewing",
            "",
            "## References",
        ]
    )

    if user_facing:
        for pr in user_facing:
            lines.append(f"- {pr.repo_short} PR #{pr.number}: {pr.url}")
    else:
        lines.append("- No user-facing PR references for this period.")

    if highlights:
        lines.extend(["", "## Automatically detected highlight themes"])
        lines.extend([f"- {highlight}" for highlight in highlights])

    return "\n".join(lines) + "\n"


def build_audit_payload(
    *,
    generated_at: str,
    since_iso: str,
    repos: list[str],
    records: list[PullRequestRecord],
) -> dict[str, Any]:
    user_facing = [record for record in records if record.user_facing]
    technical = [record for record in records if not record.user_facing]
    return {
        "generated_at": generated_at,
        "since": since_iso,
        "repos": repos,
        "totals": {
            "all": len(records),
            "user_facing": len(user_facing),
            "technical": len(technical),
        },
        "publish_recommended": should_publish_now(user_facing),
        "highlight_themes": select_highlights(user_facing),
        "prs": [asdict(record) for record in records],
    }


def write_outputs(
    *,
    output_dir: Path,
    audit_payload: dict[str, Any],
    report_markdown: str,
    social_markdown: str,
) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "latest-audit.json").write_text(
        json.dumps(audit_payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    (output_dir / "latest-report.md").write_text(report_markdown, encoding="utf-8")
    (output_dir / "latest-social-drafts.md").write_text(
        social_markdown,
        encoding="utf-8",
    )


def main() -> int:
    args = parse_args()

    try:
        feed_path = Path(args.feed_path)
        output_dir = Path(args.output_dir)

        since_iso = (
            normalize_iso_datetime(args.since)
            if args.since
            else infer_since_from_feed(feed_path)
        )
        token = (
            args.token
            or os.environ.get("GH_TOKEN", "")
            or os.environ.get("GITHUB_TOKEN", "")
        )
        repos = args.repos if args.repos else DEFAULT_REPOS

        generated_at = now_iso()
        records = collect_pr_records(
            repos=repos,
            since_iso=since_iso,
            token=token,
            max_prs=args.max_prs,
        )

        audit_payload = build_audit_payload(
            generated_at=generated_at,
            since_iso=since_iso,
            repos=repos,
            records=records,
        )
        report_markdown = render_report_markdown(
            generated_at=generated_at,
            since_iso=since_iso,
            records=records,
        )
        social_markdown = render_social_drafts_markdown(
            generated_at=generated_at,
            since_iso=since_iso,
            records=records,
        )

        write_outputs(
            output_dir=output_dir,
            audit_payload=audit_payload,
            report_markdown=report_markdown,
            social_markdown=social_markdown,
        )

        print(
            "✅ Weekly digest generated "
            f"(all={audit_payload['totals']['all']}, "
            f"user-facing={audit_payload['totals']['user_facing']}, "
            f"technical={audit_payload['totals']['technical']})"
        )
        print(f"📁 Output directory: {output_dir}")
        return 0
    except Exception as exc:  # pragma: no cover - explicit CLI failure path
        print(f"❌ Weekly digest generation failed: {exc}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
