import cv2
from ultralytics import YOLO

# 1. Load the AI Model 
model = YOLO("yolov8n-seg.pt")

# 2. Connect to the DroidCam USB Video Feed (1 usually means the external USB camera)
cap = cv2.VideoCapture(1)

print("Connecting to USB camera... Press 'q' to quit.")

# 3. The Infinite Loop
while True:
    # Grab the current frame
    success, frame = cap.read()
    
    if not success:
        print("Failed to connect. Make sure DroidCam PC client is running and phone is plugged in!")
        break

    # 4. Run the AI on the frame
    results = model(frame, conf=0.4)

    # 5. Draw the AI's findings
    annotated_frame = results[0].plot()

    # 6. Show the live video
    cv2.imshow("MessFlow Smart Scanner", annotated_frame)

    # Press 'q' to stop
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

# Clean up
cap.release()
cv2.destroyAllWindows()