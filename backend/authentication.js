// Get the functions in the db.js file to use
const db = require('./sqlConnection');
const bcrypt = require("bcryptjs");

class User {

    id;
    username;

    constructor(username) {
        this.username = username;
    }
    
    async getIdFromUsername()  {
        var sql = "SELECT id FROM users WHERE username = ?";
        const result = await db.query(sql, [this.username]);
        console.log(JSON.stringify(result))
        if (JSON.stringify(result) != '[]') {
            this.id = result[0].id;
            return this.id;
        }
        else {
            return false;
        }
    
    }

 
    async authenticate(submitted) {
        const sql = "SELECT password FROM users WHERE id = ?";
        const result = await db.query(sql, [this.id]);
    
        if (!result || result.length === 0 || !result[0].password) {
            console.log('No user found or password not set.');
            return false;
        }
    
        const storedHash = result[0].password;
    
        try {
            const match = await bcrypt.compare(submitted, storedHash);
            console.log('Password match:', match);
            return true;
        } catch (err) {
            console.error('Error during bcrypt compare:', err);
            return false;
        }
    }
    


}

module.exports  = {
    User
}