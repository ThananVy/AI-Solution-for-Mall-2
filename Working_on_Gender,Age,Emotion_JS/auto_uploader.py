import os
import time
import subprocess

# Set the detection folder path
DETECTION_FOLDER = r"C:\Users\Thanan\Desktop\AI project\Working_on_Gender,Age,Emotion_JS\Detection_result"

# PHP script path
PHP_SCRIPT_PATH = r"C:\Users\Thanan\Desktop\AI project\Working_on_Gender,Age,Emotion_JS\upload_csv.php"

def run_php_script():
    """Run the PHP script to push the CSV files to the database."""
    try:
        # Run the PHP script using subprocess
        result = subprocess.run(
            ["php", PHP_SCRIPT_PATH], capture_output=True, text=True
        )
        if result.returncode == 0:
            print(f"PHP script executed successfully.\nOutput: {result.stdout}")
        else:
            print(f"Error executing PHP script: {result.stderr}")
    except Exception as e:
        print(f"Error executing PHP script: {e}")

def delete_files():
    """Delete all the CSV files from the detection folder after pushing them."""
    try:
        files = [f for f in os.listdir(DETECTION_FOLDER) if f.endswith('.csv')]
        for file in files:
            file_path = os.path.join(DETECTION_FOLDER, file)
            os.remove(file_path)
            print(f"Deleted file: {file_path}")
    except Exception as e:
        print(f"Error deleting files: {e}")

def main():
    """Main function to run the process every 5 minutes."""
    while True:
        print("Running PHP script to push CSV files to the database...")
        run_php_script()

        print("Deleting pushed files...")
        delete_files()

        print("Waiting for 5 minutes before checking for new files...")
        time.sleep(300)  # Wait for 5 minutes (300 seconds)

if __name__ == '__main__':
    main()
