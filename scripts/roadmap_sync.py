#!/usr/bin/env python3
"""Auto-ingest roadmap updates from repository_dispatch payloads.

This script keeps two artifacts synchronized:
- docs/roadmap-feed.json (machine-readable source of truth)
- docs/ROADMAP.md Done table section between dedicated markers
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent.parent
FEED_PATH = ROOT / "docs" / "roadmap-feed.json"
ROADMAP_PATH = ROOT / "docs" / "ROADMAP.md"

START_MARKER = "<!-- ROADMAP_DONE_TABLE_START -->"
END_MARKER = "<!-- ROADMAP_DONE_TABLE_END -->"

DOMAIN_MAP = {
    "brasse-bouillon-backend": "Backend",
    "brasse-bouillon-frontend": "Frontend",
    "brasse-bouillon-website": "Website",
}


@dataclass(frozen=True)
class RoadmapPayload:
    source_repo: str
    pr_number: int
    pr_url: str
    pr_title: str
    merged_at: str
    phase: str
    impact_type: str
    summary_fr: str
    summary_en: str
    evidence_links: list[str]

    @property
    def key(self) -> str:
        return f"{self.source_repo}#{self.pr_number}"

    @property
    def date(self) -> str:
        return self.merged_at[:10]

    @property
    def domain(self) -> str:
        repo_name = self.source_repo.split("/")[-1]
        return DOMAIN_MAP.get(repo_name, repo_name)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Sync roadmap feed and markdown table from dispatch payload")
    parser.add_argument(
        "--event-path",
        default="",
        help="Path to a GitHub event JSON file (defaults to $GITHUB_EVENT_PATH when omitted)",
    )
    parser.add_argument("--payload-file", default="", help="Path to a payload JSON file")
    parser.add_argument("--payload-json", default="", help="Raw payload JSON string")
    return parser.parse_args()


def normalize_iso_datetime(raw: str) -> str:
    value = raw.strip()
    if not value:
        raise ValueError("Field 'merged_at' must be a non-empty ISO-8601 datetime")

    normalized = value.replace("Z", "+00:00") if value.endswith("Z") else value
    dt = datetime.fromisoformat(normalized)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)

    return dt.astimezone(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def parse_evidence_links(raw: Any) -> list[str]:
    if raw is None:
        return []

    if isinstance(raw, list):
        candidates = raw
    elif isinstance(raw, str):
        candidates = re.split(r"[,\n]", raw)
    else:
        raise ValueError("Field 'evidence_links' must be a string or a list")

    links: list[str] = []
    for candidate in candidates:
        if not isinstance(candidate, str):
            continue
        clean = candidate.strip()
        if clean and clean not in links:
            links.append(clean)
    return links


def parse_payload(raw: dict[str, Any]) -> RoadmapPayload:
    required_fields = [
        "source_repo",
        "pr_number",
        "pr_url",
        "pr_title",
        "merged_at",
        "phase",
        "impact_type",
        "summary_fr",
        "summary_en",
    ]

    missing = [field for field in required_fields if not str(raw.get(field, "")).strip()]
    if missing:
        raise ValueError(f"Missing required payload field(s): {', '.join(missing)}")

    try:
        pr_number = int(raw["pr_number"])
    except (TypeError, ValueError) as exc:
        raise ValueError("Field 'pr_number' must be an integer") from exc

    return RoadmapPayload(
        source_repo=str(raw["source_repo"]).strip(),
        pr_number=pr_number,
        pr_url=str(raw["pr_url"]).strip(),
        pr_title=str(raw["pr_title"]).strip(),
        merged_at=normalize_iso_datetime(str(raw["merged_at"])),
        phase=str(raw["phase"]).strip(),
        impact_type=str(raw["impact_type"]).strip(),
        summary_fr=str(raw["summary_fr"]).strip(),
        summary_en=str(raw["summary_en"]).strip(),
        evidence_links=parse_evidence_links(raw.get("evidence_links", "")),
    )


def load_raw_payload(args: argparse.Namespace) -> dict[str, Any]:
    if args.payload_json:
        data = json.loads(args.payload_json)
    elif args.payload_file:
        data = json.loads(Path(args.payload_file).read_text(encoding="utf-8"))
    else:
        event_path = args.event_path or os_environ("GITHUB_EVENT_PATH")
        if not event_path:
            raise ValueError("No payload source provided. Use --event-path, --payload-file, or --payload-json.")
        data = json.loads(Path(event_path).read_text(encoding="utf-8"))

    if not isinstance(data, dict):
        raise ValueError("Payload root must be a JSON object")

    client_payload = data.get("client_payload")
    if isinstance(client_payload, dict):
        return client_payload

    return data


def os_environ(name: str) -> str:
    # Isolated helper to keep environment access test-friendly.
    return __import__("os").environ.get(name, "")


def load_feed(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {"version": 1, "entries": []}

    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise ValueError("roadmap-feed.json must contain a JSON object")

    entries = data.get("entries")
    if not isinstance(entries, list):
        raise ValueError("roadmap-feed.json must expose an 'entries' list")

    return data


def build_entry(payload: RoadmapPayload) -> dict[str, Any]:
    return {
        "id": payload.key,
        "date": payload.date,
        "merged_at": payload.merged_at,
        "domain": payload.domain,
        "source_repo": payload.source_repo,
        "pr_number": payload.pr_number,
        "pr_url": payload.pr_url,
        "pr_title": payload.pr_title,
        "phase": payload.phase,
        "impact_type": payload.impact_type,
        "summary_fr": payload.summary_fr,
        "summary_en": payload.summary_en,
        "evidence_links": payload.evidence_links,
    }


def upsert_entry(feed: dict[str, Any], entry: dict[str, Any]) -> None:
    indexed: dict[str, dict[str, Any]] = {}
    for item in feed.get("entries", []):
        if isinstance(item, dict) and isinstance(item.get("id"), str):
            indexed[item["id"]] = item

    indexed[entry["id"]] = entry

    feed["entries"] = sorted(
        indexed.values(),
        key=lambda item: (str(item.get("merged_at", "")), str(item.get("id", ""))),
        reverse=True,
    )


def save_feed(feed: dict[str, Any], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(feed, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def markdown_link(label: str, url: str) -> str:
    return f"[{label}]({url})"


def reference_label(url: str, index: int) -> str:
    pull_match = re.search(r"github\.com/[^/]+/([^/]+)/pull/(\d+)", url)
    if pull_match:
        repo_name = pull_match.group(1).replace("brasse-bouillon-", "")
        return f"{repo_name} PR #{pull_match.group(2)}"

    commit_match = re.search(r"github\.com/[^/]+/[^/]+/commit/([a-f0-9]{7,40})", url)
    if commit_match:
        sha = commit_match.group(1)[:7]
        return f"commit {sha}"

    return f"ref {index}"


def build_references(entry: dict[str, Any]) -> str:
    source_repo = str(entry.get("source_repo", "")).strip()
    repo_name = source_repo.split("/")[-1].replace("brasse-bouillon-", "") if source_repo else "source"
    pr_number = entry.get("pr_number")
    pr_url = str(entry.get("pr_url", "")).strip()

    refs: list[str] = []
    if pr_url:
        refs.append(markdown_link(f"{repo_name} PR #{pr_number}", pr_url))

    evidence_links = entry.get("evidence_links", [])
    if isinstance(evidence_links, list):
        cursor = 1
        for url in evidence_links:
            if not isinstance(url, str):
                continue
            clean = url.strip()
            if not clean or clean == pr_url:
                continue
            refs.append(markdown_link(reference_label(clean, cursor), clean))
            cursor += 1

    return ", ".join(refs) if refs else "N/A"


def sanitize_cell(raw: Any) -> str:
    value = str(raw)
    return value.replace("|", "\\|").replace("\n", " ").strip()


def render_done_table(entries: list[dict[str, Any]]) -> str:
    lines = [
        "| Date       | Domain   | Completed action (summary) | References |",
        "| ---------- | -------- | -------------------------- | ---------- |",
    ]

    for entry in entries:
        date = sanitize_cell(entry.get("date", ""))
        domain = sanitize_cell(entry.get("domain", ""))
        summary = sanitize_cell(entry.get("summary_en") or entry.get("pr_title") or "Update")
        references = sanitize_cell(build_references(entry))
        lines.append(f"| {date} | {domain} | {summary} | {references} |")

    return "\n".join(lines)


def update_roadmap_markdown(entries: list[dict[str, Any]], path: Path) -> None:
    content = path.read_text(encoding="utf-8")
    if START_MARKER not in content or END_MARKER not in content:
        raise ValueError(
            "ROADMAP markers are missing. Expected markers: "
            f"{START_MARKER} ... {END_MARKER}"
        )

    before, right = content.split(START_MARKER, maxsplit=1)
    _, after = right.split(END_MARKER, maxsplit=1)

    table = render_done_table(entries)
    updated = f"{before}{START_MARKER}\n{table}\n{END_MARKER}{after}"
    path.write_text(updated, encoding="utf-8")


def main() -> int:
    args = parse_args()

    try:
        raw_payload = load_raw_payload(args)
        payload = parse_payload(raw_payload)

        feed = load_feed(FEED_PATH)
        upsert_entry(feed, build_entry(payload))
        save_feed(feed, FEED_PATH)

        entries = feed.get("entries", [])
        if not isinstance(entries, list):
            raise ValueError("Feed entries are invalid after update")

        update_roadmap_markdown(entries, ROADMAP_PATH)
    except Exception as exc:  # pragma: no cover - explicit CLI failure path
        print(f"❌ Roadmap sync failed: {exc}")
        return 1

    print(f"✅ Roadmap sync completed for {payload.key}")
    return 0


if __name__ == "__main__":
    sys.exit(main())