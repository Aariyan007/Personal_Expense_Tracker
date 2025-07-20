const { validationResult } = require('express-validator');
const db = require('../Db/db');
const bcrypt = require('bcrypt');


module.exports.registerUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;
    const checkQuery = "SELECT * FROM users WHERE email = ?";

    db.query(checkQuery, [email], async (err, existingUsers) => {
        if (err) {
            console.error("DB Check Error:", err);
            return res.status(500).json({ error: "Database error on checking user" });
        }

        if (existingUsers.length > 0) {
            return res.status(400).json({ error: "Email already exists" });
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const insertQuery = "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)";

            db.query(insertQuery, [username, email, hashedPassword], (err, insertResult) => {
                if (err) {
                    console.error("Insert Error:", err);
                    return res.status(500).json({ error: "Database error on insert" });
                }

                return res.status(201).json({ message: "User registered successfully" });
            });
        } catch (hashError) {
            console.error("Hashing Error:", hashError);
            return res.status(500).json({ error: "Password hashing failed" });
        }
    });
};

module.exports.loginUser = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {email, password} = req.body;

    const query = "SELECT * FROM users where email = ?";

    db.query(query,[email],async(err,results)=>{
        if(err){
            console.error("DB Query Error:", err);
            return res.status(500).json({ error: "Database error on login" });
        }

        if(results.length === 0 ){
            return res.status(401).json({error : "Invalid email or password"});
        }
        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if(!isMatch){
            return res.status(401).json({error : "Invalid email or password"});
        }
        return res.status(200).json({message : "Login successful", user: {id: user.id, username: user.username, email: user.email}});
    })


}

module.exports.getUserProfile = (req, res) => {

}