from __future__ import annotations

import argparse
import json

from ml.pipeline import scan_image


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Scan demo: beer label image -> recipe recommendations"
    )
    parser.add_argument("--image", required=True, help="Path to input image")
    parser.add_argument(
        "--recipes",
        default="data/recipes.sample.json",
        help="Path to recipes JSON file",
    )
    parser.add_argument(
        "--model",
        default=None,
        help="Path to YOLO model file (.pt)",
    )
    parser.add_argument(
        "--top",
        type=int,
        default=3,
        help="Number of recommendations to return",
    )
    return parser


def main() -> None:
    args = build_parser().parse_args()
    result = scan_image(
        image_path=args.image,
        recipes_path=args.recipes,
        model_path=args.model,
        top_n=args.top,
    )
    print(json.dumps(result.model_dump(), indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
