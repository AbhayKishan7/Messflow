from ultralytics import YOLO

# 1. Load the base AI model
model = YOLO('yolov8n-seg.pt')

# 2. Tell it to study your custom data
print("Starting MessFlow AI Training...")
results = model.train(data='custom_data/data.yaml', epochs=50, imgsz=640)
print("Training Complete! Check the 'runs' folder for best.pt")