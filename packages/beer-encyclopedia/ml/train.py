from __future__ import annotations

import argparse


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="YOLOv8 training for beer-label detection.")
    parser.add_argument("--data", required=True, help="Path to data.yaml")
    parser.add_argument("--model", default="yolov8n.pt", help="Initial YOLO weights")
    parser.add_argument("--epochs", type=int, default=50)
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--batch", type=int, default=16)
    parser.add_argument("--device", default=None, help="Example: cpu, 0")
    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()

    from ultralytics import YOLO

    model = YOLO(args.model)
    result = model.train(
        data=args.data,
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        device=args.device,
    )

    print("Training completed.")
    print(f"Results saved in: {result.save_dir}")


if __name__ == "__main__":
    main()
