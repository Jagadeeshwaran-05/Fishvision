#!/usr/bin/env python3
import sys
import os
import json
import cv2
import numpy as np
import tensorflow as tf
from ultralytics import YOLO

# Usage: classify_fish.py <image_path> <output_path> [padding]

def safe_load_models(base_dir):
    # Models folder is at repo root 'models'
    yolo_path = os.path.abspath(os.path.join(base_dir, '..', '..', 'models', 'yolov8sfish.pt'))
    class_path = os.path.abspath(os.path.join(base_dir, '..', '..', 'models', 'fishclass.h5'))

    if not os.path.exists(yolo_path):
        raise FileNotFoundError(f"YOLO model not found at {yolo_path}")
    if not os.path.exists(class_path):
        raise FileNotFoundError(f"Classification model not found at {class_path}")

    yolo_model = YOLO(yolo_path)
    class_model = tf.keras.models.load_model(class_path)
    return yolo_model, class_model

class_labels = ['Bangus', 'Big Head Carp', 'Black Spotted Barb', 'Catfish', 'Climbing Perch', 'Fourfinger Threadfin', 'Freshwater Eel', 'Glass Perchlet', 'Goby', 'Gold Fish', 'Gourami', 'Grass Carp', 'Green Spotted Puffer', 'Indian Carp', 'Indo-Pacific Tarpon', 'Jaguar Gapote', 'Janitor Fish', 'Knifefish', 'Long-Snouted Pipefish', 'Mosquito Fish', 'Mudfish', 'Mullet', 'Pangasius', 'Perch', 'Scat Fish', 'Silver Barb', 'Silver Carp', 'Silver Perch', 'Snakehead', 'Tenpounder', 'Tilapia']

def classify_fish(class_model, crop):
    img = cv2.resize(crop, (224, 224))
    img = img.astype('float32') / 255.0
    img = np.expand_dims(img, axis=0)
    preds = class_model.predict(img, verbose=0)
    class_id = int(np.argmax(preds))
    conf = float(preds[0][class_id])
    label = class_labels[class_id] if class_id < len(class_labels) else str(class_id)
    return label, conf

def process_image(image_path, output_path, padding=20):
    base_dir = os.path.dirname(__file__)
    yolo_model, class_model = safe_load_models(base_dir)

    img = cv2.imread(image_path)
    if img is None:
        return {"success": False, "error": f"Could not read image {image_path}"}

    h, w = img.shape[:2]
    results = yolo_model.predict(img, verbose=False)
    detections = []
    fish_count = 0

    for r in results:
        if getattr(r, 'boxes', None) is None:
            continue
        boxes = r.boxes.xyxy.cpu().numpy().astype(int)
        for box in boxes:
            x1, y1, x2, y2 = box.tolist()
            x1_p = max(0, x1 - padding)
            y1_p = max(0, y1 - padding)
            x2_p = min(w, x2 + padding)
            y2_p = min(h, y2 + padding)

            crop = img[y1_p:y2_p, x1_p:x2_p]
            if crop.size == 0:
                continue

            label, conf = classify_fish(class_model, crop)
            fish_count += 1

            detections.append({
                "bbox": [int(x1_p), int(y1_p), int(x2_p), int(y2_p)],
                "label": label,
                "confidence": float(conf)
            })

            cv2.rectangle(img, (x1_p, y1_p), (x2_p, y2_p), (0, 255, 0), 2)
            cv2.putText(img, f"{label} ({conf:.2f})", (x1_p, max(0, y1_p - 10)), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0,255,0), 2)

    # Ensure output dir exists
    outdir = os.path.dirname(output_path)
    os.makedirs(outdir, exist_ok=True)
    cv2.imwrite(output_path, img)

    return {
        "success": True,
        "output_image": output_path,
        "fish_count": fish_count,
        "detections": detections
    }

def main():
    if len(sys.argv) < 3:
        print(json.dumps({"success": False, "error": "Usage: classify_fish.py <image_path> <output_path> [padding]"}))
        sys.exit(1)

    image_path = sys.argv[1]
    output_path = sys.argv[2]
    padding = int(sys.argv[3]) if len(sys.argv) >= 4 else 20

    try:
        result = process_image(image_path, output_path, padding)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    main()
