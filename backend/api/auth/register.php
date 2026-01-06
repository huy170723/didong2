<?php
require_once '../../config/database.php';

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->email) && !empty($data->password) && !empty($data->name)) {
    $hashed_password = password_hash($data->password, PASSWORD_DEFAULT);
    
    $query = "INSERT INTO users (name, email, password, phone, address) 
              VALUES (:name, :email, :password, :phone, :address)";
    
    $stmt = $conn->prepare($query);
    
    $stmt->bindParam(':name', $data->name);
    $stmt->bindParam(':email', $data->email);
    $stmt->bindParam(':password', $hashed_password);
    $stmt->bindParam(':phone', $data->phone);
    $stmt->bindParam(':address', $data->address);
    
    if($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "User registered successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Registration failed"]);
    }
}
?>