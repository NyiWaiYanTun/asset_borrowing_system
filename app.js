const { log } = require('console');
const express = require('express');
const path = require('path');
const app = express();
const multer = require('multer');
// links for bootstap and css and js
app.use('/public', express.static(path.join(__dirname, '/public')));
// make it available to pass the data in json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const con = require('../Asset borrowing system/config/db.js');
//importing the bcrypt 
const bcrypt = require('bcrypt');

//password bcrypt testing
app.get('/password/:pass', function (req, res) {
    const raw = req.params.pass;
    bcrypt.hash(raw, 10, function (err, hash) {
        if (err) {
            res.status(500).send('server error');
        } else {
            console.log(hash.length);
            bcrypt.compare(raw, hash, function (err, same) {
                if (err) {
                    console.error(err);
                    console.log("error comparing");;
                } else {
                    console.log(same);
                }
            });
            res.send(hash);
        }
    });
})
// Landing page and register
app.get('/', function (_req, res) {
    res.sendFile(path.join(__dirname, 'ZLandingPage.html'));
});
app.get('/Register', function (_req, res) {
    res.sendFile(path.join(__dirname, 'ZRegister.html'));
});
// pages for student
app.get('/StudentLogin', function (_req, res) {
    res.sendFile(path.join(__dirname, 'StudentLogin.html'));
});
app.get('/StudentHome', function (_req, res) {
    res.sendFile(path.join(__dirname, 'StudentHome.html'));
});
app.get('/StudentAssetList', function (_req, res) {
    res.sendFile(path.join(__dirname, 'StudentAssetList.html'));
});
app.get('/StudentRequestedItem', function (_req, res) {
    res.sendFile(path.join(__dirname, 'StudentRequestedItem.html'));
});
app.get('/StudentHistory', function (_req, res) {
    res.sendFile(path.join(__dirname, 'StudentHistory.html'));
});
app.get('/StudentProfile', function (_req, res) {
    res.sendFile(path.join(__dirname, 'StudentProfile.html'));
});
// pages for Staff
app.get('/StaffLogin', function (_req, res) {
    res.sendFile(path.join(__dirname, 'StaffLogin.html'));
});
app.get('/StaffDashboard', function (_req, res) {
    res.sendFile(path.join(__dirname, 'StaffDashboard.html'));
});
app.get('/StaffAssetList', function (_req, res) {
    res.sendFile(path.join(__dirname, 'StaffAssetList.html'));
});
app.get('/StaffAddItem', function (_req, res) {
    res.sendFile(path.join(__dirname, 'StaffAddItem.html'));
});
app.get('/StaffTakeOutItem', function (_req, res) {
    res.sendFile(path.join(__dirname, 'StaffTakeOutItem.html'));
});
app.get('/StaffReturnItem', function (_req, res) {
    res.sendFile(path.join(__dirname, 'StaffReturnItem.html'));
});
app.get('/StaffHistory', function (_req, res) {
    res.sendFile(path.join(__dirname, 'StaffHistory.html'));
});
app.get('/StaffEditItem', function (_req, res) {
    res.sendFile(path.join(__dirname, 'StaffEditItem.html'));
});
app.get('/StaffProfile', function (_req, res) {
    res.sendFile(path.join(__dirname, 'StaffProfile.html'));
});
// pages for Lecturer
app.get('/LecturerLogin', function (_req, res) {
    res.sendFile(path.join(__dirname, 'LecturerLogin.html'));
});
app.get('/LecturerDashboard', function (_req, res) {
    res.sendFile(path.join(__dirname, 'LecturerDashboard.html'));
});
app.get('/LecturerAssetList', function (_req, res) {
    res.sendFile(path.join(__dirname, 'LecturerAssetList.html'));
});
app.get('/LecturerBorrowRequest', function (_req, res) {
    res.sendFile(path.join(__dirname, 'LecturerBorrowRequest.html'));
});
app.get('/LecturerHistory', function (_req, res) {
    res.sendFile(path.join(__dirname, 'LecturerHistory.html'));
});
app.get('/LecturerProfile', function (_req, res) {
    res.sendFile(path.join(__dirname, 'LecturerProfile.html'));
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/img/') // Specify the directory to store uploaded files
    },
    filename: function (req, file, cb) {
      // Generate a unique filename for the uploaded file
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
  });
const upload = multer({ storage: storage });
function isValidEmail(email) {
    // Regular expression pattern for validating email addresses
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }
app.post('/register',upload.single('image'),function (req, res) {
    // var name = req.body.name;
    // var email = req.body.email;
    // var password = req.body.password;
    // var confirmPassword = req.body.confirmPassword;
    // Check if all required fields are provided
    const { name, email, password, confirmPassword } = req.body;
    const profilePictureUrl = req.file ? `/public/img/${req.file.filename}` : '/public/img/no-photo.jpg';
    if (!name || !email || !password || !confirmPassword) {
        return res.status(400).send("All fields are required.");
    }
    //  check if email looks like an email
    if(isValidEmail(email)==false){
        return res.status(400).send("Enter a valid email");
    }
    // Check if email is already in use
    con.query('SELECT * FROM users WHERE email = ?', [email], function (err, result) {
        if (err) {
            console.error("Error checking email:", err);
            return res.status(500).send("Server error");
        }
        if (result.length != 0) {
            // Email already exists in the database
            console.log("already in use");
            return res.status(400).send("Email already in use.");
        } else {
            // Perform user registration
            if (password.length<4) {
                console.log("Passwords needs to be at least 4 characters long");
                return res.status(400).send("Passwords needs to be at least 4 characters long");
            }
            if (password != confirmPassword) {
                console.log("Passwords do not match");
                return res.status(400).send("Passwords do not match");
            }
            bcrypt.hash(password, 10, function (err, hash) {
                if (err) {
                    console.error("Hashing error:", err);
                    return res.status(500).send("Server error");
                } else {
                    con.query('INSERT INTO users (name, email, psw, profile_pic, type_id) VALUES (?, ?, ?, ?, ?)', [name, email, hash, profilePictureUrl, 1], function (err, result) {
                        if (err) {
                            console.error("Error inserting new user:", err);
                            return res.status(500).send("Server error");
                        }
                        else {
                            console.log("Successful");
                            res.status(200).send("User registered successfully.");
                        }
                    })
                }
            })
        }
    });
});

function Login(email, password, type, res){
    if (!email || !password) {
        return res.status(400).send("All fields are required.");
    }
    con.query('SELECT email, name, psw, profile_pic, type_id FROM users WHERE email = ? AND type_id = ?', [email, type], function (err, result) {
        if (err) {
            console.error("Error checking email:", err);
            return res.status(500).send("Server error");
        } else if (result.length != 1) {
            console.log("Email not found");
            return res.status(400).send("Email not found");
        } else {
            bcrypt.compare(password, result[0].psw, function (err, same) {
                if (err) {
                    console.error("Error checking password:", err);
                    return res.status(500).send("Server error");
                }
                else {
                    if (same) {
                        console.log("Successful");
                        const combinedData = `${result[0].email}|${result[0].name}|${result[0].profile_pic}|${result[0].type_id}`;
                        return res.status(200).send(combinedData);
                    }else{
                        console.log("Wrong password");
                        return res.status(400).send("Wrong password");
                    }
                }
            })
        }
    })
}
app.post('/StudentLogin', function (req, res) {
    const email = req.body.email;
    const password = req.body.password;
    Login(email, password, 1, res);
    
});
app.post('/StaffLogin', function (req, res) {
    const email = req.body.email;
    const password = req.body.password;
    Login(email, password, 3, res);
});
app.post('/LecturerLogin', function (req, res) {
    const email = req.body.email;
    const password = req.body.password;
    Login(email, password, 2, res);
});

// Listening to the port
app.listen(4000, () => {
    console.log('Server is running at port 4000...');
})