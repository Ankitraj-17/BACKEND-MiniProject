const express = require('express');
const fs = require('fs');
const path = require('path');


const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'students.json');
module.exports = { DATA_FILE };


app.use(express.json());


app.post('/students', (req, res) => {
  const { name, course, email } = req.body;


  if (!name || !course || !email || !name.trim() || !course.trim() || !email.trim()) {
    return res.status(400).json({
      success: false,
      message: 'name, course and email are required'
    });
  }


  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    let students = [];

    if (!err && data.trim()) {
      try {
        students = JSON.parse(data);
      } catch (parseError) {
        return res.status(500).json({
          success: false,
          message: 'Error parsing student database'
        });
      }
    }
    const nextId = students.length > 0
      ? Math.max(...students.map(s => Number(s.id) || 0)) + 1
      : 1;

    const newStudent = {
      id: nextId,
      name: name.trim(),
      course: course.trim(),
      email: email.trim()
    };


    students.push(newStudent);

   
    fs.writeFile(DATA_FILE, JSON.stringify(students, null, 2), (writeErr) => {
      if (writeErr) {
        return res.status(500).json({
          success: false,
          message: 'Error saving student data'
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Student added successfully',
        data: newStudent
      });
    });
  });
});

  
app.get('/students', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error reading student database'
      });
    }

    try {
      const students = data.trim() ? JSON.parse(data) : [];
      return res.status(200).json({
        success: true,
        count: students.length,
        data: students
      });
    } catch (parseError) {
      return res.status(500).json({
        success: false,
        message: 'Error parsing student database'
      });
    }
  });
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}).on('error', (error) => {
  console.error('Error starting the server:', error);
});
