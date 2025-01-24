<?php
// Database connection
$conn = new mysqli("localhost", "root", "", "facial_detection_db");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Define the folder path
$folder = "C:/Users/Thanan/Desktop/AI project/Working_on_Gender,Age,Emotion_JS/Detection_result";

// Get all .csv files in the folder
$files = glob($folder . "/*.csv");

if (empty($files)) {
    die("No CSV files found in the folder: " . $folder);
}

// Loop through each CSV file
foreach ($files as $file) {
    echo "Processing file: " . basename($file) . "<br>";

    // Open the file for reading
    $handle = fopen($file, "r");
    if ($handle !== FALSE) {
        //fgetcsv($handle); // Skip the header row (remove this line if no headers)
        while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
            // Extract data from each row
            $age = $data[0];
            $gender = $data[1];
            $emotion = $data[2];

            // Prepare the SQL query
            $sql = "INSERT INTO facial_data (age, gender, emotion) VALUES ('$age', '$gender', '$emotion')";

            // Execute the query and handle errors
            if ($conn->query($sql)) {
                echo "Data inserted successfully: Age=$age, Gender=$gender, Emotion=$emotion<br>";
            } else {
                echo "Error inserting data: " . $conn->error . "<br>";
            }
        }
        fclose($handle);
    } else {
        echo "Could not open the file: " . $file . "<br>";
    }
}

$conn->close();
?>
