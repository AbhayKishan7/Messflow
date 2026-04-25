import cv2
from ultralytics import YOLO
from flask import Flask, Response, jsonify
from flask_cors import CORS
import csv
from datetime import datetime
import os

# 1. Initialize the Flask Web Server FIRST (This fixes your NameError!)
app = Flask(__name__)
CORS(app)

# 2. Load your AI Model
model = YOLO("best.pt")

# 3. Connect to IP Webcam over Wi-Fi
# Connect to Camo Studio Virtual Camera
camera = cv2.VideoCapture(0)

# Global variables to store the latest waste data
current_waste_data = {
    "total_waste_kg": 0.0,
    "rice_waste_pct": 0,
    "dal_waste_pct": 0
}

def generate_frames():
    global current_waste_data
    
    while True:
        success, frame = camera.read()
        if not success:
            break
            
        # Run your Custom AI on the frame
        results = model(frame, conf=0.5) 
        annotated_frame = results[0].plot()
        
# --- NEW DYNAMIC DETECTION LOGIC ---
        rice_pct = 0
        dal_pct = 0
        base_waste = 0.0
        detected_food_names = [] 
        
        # --- NEW: The Ignore List ---
        # Add any background items here that you don't want logged
        ignore_list = ["Plate", "Tray", "Steel Plate", "Table"] 
        
        # Check exactly what the AI found on the plate
        for box in results[0].boxes:
            class_id = int(box.cls[0])
            food_name = model.names[class_id].title() 
            
            # If the AI sees a Plate, skip this loop completely!
            if food_name in ignore_list:
                continue 
            
            # If it's actual food, add it to our list
            if food_name not in detected_food_names:
                detected_food_names.append(food_name)
            
            # Simulated waste math 
            if "Rice" in food_name:
                rice_pct = 15
                base_waste += 0.8
            elif "Dal" in food_name:
                dal_pct = 5
                base_waste += 0.4
            else:
                # This ensures Roti, Dahi, etc. get a waste value!
                base_waste += 0.35 
                
        # Update the live dashboard data
        current_waste_data["rice_waste_pct"] = rice_pct
        current_waste_data["dal_waste_pct"] = dal_pct
        current_waste_data["total_waste_kg"] = round(base_waste, 2)
        
        # Package the exact names to send to Javascript
        current_waste_data["detected_items"] = detected_food_names

        # Encode the frame as a JPEG to send to the HTML website
        ret, buffer = cv2.imencode('.jpg', annotated_frame)
        frame_bytes = buffer.tobytes()
        
        # Yield the frame
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')# Route 1: Sends the live video to your HTML
@app.route('/video_feed')

def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

# Route 2: Sends the waste math to your JavaScript
@app.route('/api/waste_data')
def waste_data():
    return jsonify(current_waste_data)

# Route 3: Saves Data to CSV when the button is clicked
@app.route('/api/save_data', methods=['POST'])
def save_data():
    file_exists = os.path.isfile('waste_log.csv')
    
    with open('waste_log.csv', mode='a', newline='') as file:
        writer = csv.writer(file)
        
        if not file_exists:
            writer.writerow(['Timestamp', 'Total Waste (kg)', 'Rice Waste (%)', 'Dal Waste (%)'])
            
        writer.writerow([
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"), 
            current_waste_data["total_waste_kg"], 
            current_waste_data["rice_waste_pct"], 
            current_waste_data["dal_waste_pct"]
        ])
        
    return jsonify({"status": "success", "message": "Data saved to CSV!"})

if __name__ == '__main__':
    # Runs the server
    app.run(host='0.0.0.0', port=5000, debug=False)