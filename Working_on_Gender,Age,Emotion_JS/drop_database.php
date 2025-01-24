<?php
// Database connection
$conn = new mysqli("localhost", "root", "", "facial_detection_db");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Table(s) to truncate
$tables = ["facial_data"];

foreach ($tables as $table) {
    $sql = "TRUNCATE TABLE $table"; // Use TRUNCATE for fast deletion
    
    if ($conn->query($sql)) {
        echo "All data from table '$table' has been successfully deleted.<br>";
    } else {
        echo "Error deleting data from table '$table': " . $conn->error . "<br>";
    }
}

$conn->close();
?>