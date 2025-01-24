from flask import Flask, request, jsonify
import os
import csv
from datetime import datetime
from flask_cors import CORS

# Define the app first
app = Flask(__name__)

# Enable CORS after the app is defined
CORS(app)

# Set the save directory
SAVE_DIR = r"C:\Users\Thanan\Desktop\AI project\Working_on_Gender,Age,Emotion_JS\Detection_result"
os.makedirs(SAVE_DIR, exist_ok=True)

@app.route('/save-detection', methods=['POST'])
def save_detection():
    data = request.json
    if not data or "detections" not in data:
        app.logger.error(f"Invalid data received: {data}")
        return jsonify({"error": "Invalid data"}), 400

    # Generate a unique filename based on current time
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = os.path.join(SAVE_DIR, f"detection_{timestamp}.csv")

    # Save data to CSV
    try:
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=["age", "gender", "expression"])
            writer.writeheader()
            writer.writerows(data["detections"])

        return jsonify({"message": f"Saved to {filename}"}), 200
    except Exception as e:
        app.logger.error(f"Error saving detection data: {str(e)}")
        return jsonify({"error": "Error saving detection data"}), 500


if __name__ == '__main__':
    app.run(port=5000)
