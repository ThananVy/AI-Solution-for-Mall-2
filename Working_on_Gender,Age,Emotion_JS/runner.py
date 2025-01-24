import os
import subprocess
from http.server import HTTPServer, SimpleHTTPRequestHandler
import threading
import webbrowser

class CustomHTTPRequestHandler(SimpleHTTPRequestHandler):
    """Custom handler to serve index.html as the default file."""
    def do_GET(self):
        if self.path == "/":  # Redirect root to index.html
            self.path = "/index.html"
        return super().do_GET()

def start_live_server(directory, port=5500):
    """Starts a live server for the given directory."""
    os.chdir(directory)  # Change directory to the location of index.html
    handler = CustomHTTPRequestHandler
    server = HTTPServer(("127.0.0.1", port), handler)

    print(f"Serving files from {directory} at http://127.0.0.1:{port}")
    webbrowser.open(f"http://127.0.0.1:{port}/index.html")  # Open index.html in the default browser
    server.serve_forever()

def open_xampp(shortcut_path):
    """Opens the XAMPP control panel from a shortcut."""
    try:
        print(f"Launching XAMPP from {shortcut_path}...")
        subprocess.Popen(['explorer', shortcut_path], shell=True)
    except Exception as e:
        print(f"Error launching XAMPP: {e}")

if __name__ == "__main__":
    # Path to the directory containing index.html
    html_directory = r"C:\Users\Thanan\Desktop\AI project\Working_on_Gender,Age,Emotion_JS"
    # Path to XAMPP shortcut
    xampp_shortcut_path = r"C:\ProgramData\Microsoft\Windows\Start Menu\Programs\XAMPP\XAMPP Control Panel.lnk"

    # Start the live server in a separate thread
    server_thread = threading.Thread(target=start_live_server, args=(html_directory,))
    server_thread.daemon = True
    server_thread.start()

    # Open XAMPP
    open_xampp(xampp_shortcut_path)

    # Keep the main program running
    input("Press Enter to stop the server and close the program...\n")
