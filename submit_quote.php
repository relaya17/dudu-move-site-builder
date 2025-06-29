<?php
$host = 'localhost';
$db = 'your_database_name'; // שימי את שם הדאטהבייס שלך
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

// התחברות
$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    die('שגיאה: ' . $e->getMessage());
}

// קבלת נתוני הטופס
$full_name = $_POST['full_name'];
$phone = $_POST['phone'];
$email = $_POST['email'];
$from_location = $_POST['from_location'];
$to_location = $_POST['to_location'];
$date = $_POST['date'];
$message = $_POST['message'];

// שליחת הנתונים לטבלה
$sql = "INSERT INTO quotes (full_name, phone, email, from_location, to_location, date, message) 
        VALUES (?, ?, ?, ?, ?, ?, ?)";
$stmt = $pdo->prepare($sql);
$stmt->execute([$full_name, $phone, $email, $from_location, $to_location, $date, $message]);

echo "הצעת המחיר נשלחה בהצלחה!";
?>
