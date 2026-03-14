const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection — these env vars will come from K8s secrets/configmap
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("DB connection failed:", err.message);
  } else {
    console.log("Connected to MySQL");
    seedDatabase();
  }
});

// Seed sample student data
function seedDatabase() {
  const createTable = `
    CREATE TABLE IF NOT EXISTS students (
      id INT AUTO_INCREMENT PRIMARY KEY,
      symbol_no VARCHAR(20) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      address VARCHAR(200),
      faculty VARCHAR(100),
      exam_year VARCHAR(10),
      mathematics VARCHAR(5),
      science VARCHAR(5),
      english VARCHAR(5),
      nepali VARCHAR(5),
      social VARCHAR(5),
      gpa DECIMAL(3,2)
    )
  `;

  db.query(createTable, (err) => {
    if (err) return console.error("Table creation error:", err.message);

    const checkData = "SELECT COUNT(*) AS count FROM students";
    db.query(checkData, (err, results) => {
      if (err || results[0].count > 0) return;

      const students = [
        ["10001", "Aarav Sharma", "Kathmandu, Bagmati", "Science", "2081", "A+", "A+", "A", "A+", "A", 3.95],
        ["10002", "Priya Thapa", "Pokhara, Gandaki", "Management", "2081", "A", "B+", "A+", "A", "B+", 3.72],
        ["10003", "Bikash Gurung", "Lalitpur, Bagmati", "Science", "2081", "A+", "A+", "A+", "A", "A+", 3.98],
        ["10004", "Sita Rai", "Biratnagar, Koshi", "Humanities", "2081", "B+", "B", "A", "A+", "A", 3.55],
        ["10005", "Rohan KC", "Chitwan, Bagmati", "Science", "2081", "A", "A+", "B+", "A", "A+", 3.80],
        ["10006", "Anita Magar", "Butwal, Lumbini", "Management", "2081", "B+", "A", "A", "B+", "A", 3.65],
        ["10007", "Dipesh Limbu", "Dharan, Koshi", "Science", "2081", "A+", "A", "A+", "A+", "A", 3.90],
        ["10008", "Kavya Shrestha", "Bhaktapur, Bagmati", "Humanities", "2081", "A", "B+", "A+", "A", "A+", 3.78],
      ];

      const insertQuery = `INSERT INTO students 
        (symbol_no, name, address, faculty, exam_year, mathematics, science, english, nepali, social, gpa) 
        VALUES ?`;

      db.query(insertQuery, [students], (err) => {
        if (err) console.error("Seed error:", err.message);
        else console.log("Sample student data seeded successfully");
      });
    });
  });
}

// GET /result/:symbolNo
app.get("/result/:symbolNo", (req, res) => {
  const { symbolNo } = req.params;

  const query = "SELECT * FROM students WHERE symbol_no = ?";
  db.query(query, [symbolNo], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "No result found for this symbol number" });
    }
    res.json(results[0]);
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Result system backend running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
