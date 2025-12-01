#!/usr/bin/env python3
"""
Convert fish classification models to TensorFlow Lite for mobile deployment
"""
import os
import sys
import tensorflow as tf
import numpy as np
from ultralytics import YOLO

def convert_keras_to_tflite():
    """Convert fishclass.h5 to TensorFlow Lite"""
    print("🔄 Converting fishclass.h5 to TensorFlow Lite...")
    
    # Load the Keras model
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    model_path = os.path.join(base_dir, 'models', 'fishclass.h5')
    model = tf.keras.models.load_model(model_path)
    
    print(f"   Model loaded: {model.name}")
    print(f"   Input shape: {model.input_shape}")
    print(f"   Output shape: {model.output_shape}")
    
    # Convert to TensorFlow Lite
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    
    # Optimization for mobile
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    converter.target_spec.supported_types = [tf.float16]  # Use FP16 for smaller size
    
    tflite_model = converter.convert()
    
    # Save the model
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    output_path = os.path.join(base_dir, 'models', 'fishclass.tflite')
    with open(output_path, 'wb') as f:
        f.write(tflite_model)
    
    file_size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"   ✅ Saved to: {output_path}")
    print(f"   📦 Size: {file_size_mb:.2f} MB")
    
    # Test the converted model
    interpreter = tf.lite.Interpreter(model_path=output_path)
    interpreter.allocate_tensors()
    
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    
    print(f"   🧪 TFLite Input shape: {input_details[0]['shape']}")
    print(f"   🧪 TFLite Output shape: {output_details[0]['shape']}")
    
    return output_path

def convert_yolo_to_tflite():
    """Convert YOLOv8 to TensorFlow Lite"""
    print("\n🔄 Converting yolov8sfish.pt to TensorFlow Lite...")
    
    try:
        # Load YOLO model
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        model_path = os.path.join(base_dir, 'models', 'yolov8sfish.pt')
        model = YOLO(model_path)
        
        print(f"   Model loaded: YOLOv8")
        
        # Export to TensorFlow Lite
        # YOLOv8 has built-in export functionality
        output_path = model.export(format='tflite', imgsz=640)
        
        file_size_mb = os.path.getsize(output_path) / (1024 * 1024)
        print(f"   ✅ Saved to: {output_path}")
        print(f"   📦 Size: {file_size_mb:.2f} MB")
        
        return output_path
        
    except Exception as e:
        print(f"   ⚠️  Error: {e}")
        print(f"   💡 YOLOv8 export to TFLite may require additional dependencies")
        print(f"   💡 Alternative: Use ONNX format and convert manually")
        return None

def export_yolo_to_onnx():
    """Export YOLO to ONNX as alternative"""
    print("\n🔄 Exporting YOLOv8 to ONNX (alternative format)...")
    
    try:
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        model_path = os.path.join(base_dir, 'models', 'yolov8sfish.pt')
        model = YOLO(model_path)
        
        # Export to ONNX
        output_path = model.export(format='onnx', imgsz=640)
        
        file_size_mb = os.path.getsize(output_path) / (1024 * 1024)
        print(f"   ✅ Saved to: {output_path}")
        print(f"   📦 Size: {file_size_mb:.2f} MB")
        print(f"   💡 ONNX can be converted to TFLite using tf2onnx")
        
        return output_path
        
    except Exception as e:
        print(f"   ⚠️  Error: {e}")
        return None

def create_labels_file():
    """Create a labels file for the classification model"""
    print("\n📝 Creating labels file...")
    
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    class_labels = [
        'Bangus', 'Big Head Carp', 'Black Spotted Barb', 'Catfish', 
        'Climbing Perch', 'Fourfinger Threadfin', 'Freshwater Eel', 
        'Glass Perchlet', 'Goby', 'Gold Fish', 'Gourami', 'Grass Carp', 
        'Green Spotted Puffer', 'Indian Carp', 'Indo-Pacific Tarpon', 
        'Jaguar Gapote', 'Janitor Fish', 'Knifefish', 'Long-Snouted Pipefish', 
        'Mosquito Fish', 'Mudfish', 'Mullet', 'Pangasius', 'Perch', 
        'Scat Fish', 'Silver Barb', 'Silver Carp', 'Silver Perch', 
        'Snakehead', 'Tenpounder', 'Tilapia'
    ]
    
    output_path = os.path.join(base_dir, 'models', 'labels.txt')
    with open(output_path, 'w') as f:
        for label in class_labels:
            f.write(f"{label}\n")
    
    print(f"   ✅ Saved {len(class_labels)} labels to: {output_path}")
    return output_path

def main():
    print("=" * 60)
    print("🐟 Fish Classification Model Converter")
    print("   Converting models for mobile deployment")
    print("=" * 60)
    
    try:
        # Convert classification model
        fishclass_tflite = convert_keras_to_tflite()
        
        # Try to convert YOLO
        yolo_tflite = convert_yolo_to_tflite()
        
        # If YOLO TFLite fails, export to ONNX
        if yolo_tflite is None:
            yolo_onnx = export_yolo_to_onnx()
        
        # Create labels file
        labels_file = create_labels_file()
        
        print("\n" + "=" * 60)
        print("✅ Conversion Complete!")
        print("=" * 60)
        print("\n📋 Summary:")
        print(f"   ✅ Classification Model: fishclass.tflite")
        if yolo_tflite:
            print(f"   ✅ Detection Model: {os.path.basename(yolo_tflite)}")
        else:
            print(f"   ⚠️  Detection Model: Export to ONNX (manual conversion needed)")
        print(f"   ✅ Labels: labels.txt")
        
        print("\n📱 Next Steps:")
        print("   1. Copy .tflite files to fishclassify/assets/models/")
        print("   2. Copy labels.txt to fishclassify/assets/models/")
        print("   3. Install TensorFlow Lite React Native dependencies")
        print("   4. Implement on-device inference")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
