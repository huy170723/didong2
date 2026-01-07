<?php
require_once '../../config/database.php';

$query = "SELECT * FROM cars WHERE status = 'available'";
$stmt = $conn->prepare($query);
$stmt->execute();

$cars = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Thêm đường dẫn đầy đủ cho ảnh
foreach ($cars as &$car) {
    $car['images'] = json_decode($car['images'], true);
    $car['image_url'] = "http://localhost/car_api/uploads/" . $car['images'][0];
}

echo json_encode(["success" => true, "data" => $cars]);
?>