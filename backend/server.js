const express = require("express");
const cors = require("cors");

const app = express();
const db = require('./sqlConnection');
const { User } = require("./authentication");


app.use(cors()); 
app.use(express.json()); 


app.get("/drs/drsDetails/:date", (req, res) => {
    const { date } = req.params;
    console.log(date)
    var sql =  "SELECT * FROM drsDetails WHERE drsDate = ?";
    db.query(sql,[date]).then(results => {
        console.log(results)
        return res.json({drs:results}); 
    })
});

app.post('/signIn',async (req, res) => {
    params = req.body;
    var user = new User(params.username);
    try {
        uId = await user.getIdFromUsername();
        console.log(uId,'uId')
        if (uId) {
            match = await user.authenticate(params.password);
            console.log(match,'match')
            if (match) {
                // req.session.uid = uId;
                // req.session.loggedIn = true;
                // console.log(req.session.id);
                var sql = "SELECT * FROM users WHERE id = ?";
                const result = await db.query(sql, [uId]); 
                if (result.length > 0) {
                    res.send({ success: true, message: 'Login successful!' });
                  } else {
                    res.send({ success: false, message: 'Invalid credentials' });
                  }
                
            }
            else {
                res.send('invalid password');
            }
        }
        else {
            res.send('invalid email');
        }
    } catch (err) {
        console.error(`Error while comparing `, err.message);
    }
  });
app.get("/drs/drsList", (req, res) => {
    var sql = "select * from drsList";
    db.query(sql).then(results => {
        console.log(results)
        return res.json({drs:results}); 
    })
});


app.post("/drs/createDrs", async (req, res) => {
    const jsonFields = ["costaReading", "scratchCardDetails", "atmDetails", "balanceDetails", "tillPaidOut", "otherServices", "fuelBunker"];

    jsonFields.forEach((field) => {
        if (req.body[field]) {
            req.body[field] = JSON.stringify(req.body[field]);
        }
    });

    const fields = Object.keys(req.body);
    const values = Object.values(req.body);
    const drsDate = req.body.drsDate;

    if (!drsDate) {
        return res.status(400).json({ success: false, error: "Missing drsDate field" });
    }

    try {
        const [existing] = await db.query(`SELECT * FROM drsDetails WHERE drsDate = ${drsDate}`, [drsDate]);
        console.log(existing)
        if (existing === undefined) {
          
            const placeholders = fields.map(() => "?").join(", ");
            const insertSql = `INSERT INTO drsDetails (${fields.join(", ")}) VALUES (${placeholders})`;
            const result = await db.query(insertSql, values);

            // console.log("Insert Success:", result);
            return res.json({ success: true, drs: result });
        }
    } catch (err) {
        console.error("Drs already created on  this date", err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// app.post("/drs/createDrs", (req, res) => {
//     // Convert JSON fields to strings
//     const jsonFields = ["costaReading", "scratchCardDetails", "atmDetails", "balanceDetails","tillPaidOut","otherServices","fuelBunker"];
    
//     // Convert JSON fields to JSON strings if they exist in req.body
//     jsonFields.forEach((field) => {
//         if (req.body[field]) {
//             req.body[field] = JSON.stringify(req.body[field]);
//         }
//     });

//     // Extract field names and values from req.body
//     const fields = Object.keys(req.body);
//     const values = Object.values(req.body);

//     // Construct SQL query dynamically
//     const placeholders = fields.map(() => "?").join(", ");
//     const sql = `INSERT INTO drsDetails (${fields.join(", ")}) VALUES (${placeholders})`;

//     // Execute the query
//     db.query(sql, values)
//         .then((results) => {
//             console.log("Insert Success:", results);
//             return res.json({ success: true, drs: results });
//         })
//         .catch((err) => {
//             console.error("Database Insert Error:", err);
//             return res.status(500).json({ success: false, error: err.message });
//         });
// });

app.post("/drs/drsList", async (req, res) => {
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);
    const drsDate = req.body.drsDate;

    if (!drsDate) {
        return res.status(400).json({ success: false, error: "Missing drsDate field" });
    }

    try {
        const [existing] = await db.query("SELECT * FROM drsList WHERE drsDate = ?", [drsDate]);
        console.log(existing)

        if (existing&&existing.length > 0) {
            return res.status(409).json({ success: false, message: "DRS with this date already exists" });
        }
        const placeholders = fields.map(() => "?").join(", ");
        const sql = `INSERT INTO drsList (${fields.join(", ")}) VALUES (${placeholders})`;

        const results = await db.query(sql, values);
        console.log("Insert Success:", results);
        return res.json({ success: true, drs: results });
    } catch (err) {
        console.error("Database Insert Error:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

app.put("/drs/drsDetails/:date", async (req, res) => {
    const drsDate = req.params.date;
    const data = req.body;
  
    if (!drsDate) {
      return res.status(400).json({ success: false, error: "Missing drsDate parameter" });
    }
  
    try {
      const fields = Object.keys(data);
      const values = Object.values(data);
  
      const updateFields = fields.map(field => `${field} = ?`).join(", ");
      const sql = `UPDATE drsDetails SET ${updateFields} WHERE drsDate = ?`;
  
      const result = await db.query(sql, [...values, drsDate]);
  
      res.json({ success: true, message: "DRS updated successfully", result });
    } catch (err) {
      console.error("Update Error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });
  

app.listen(3001,function(){
    console.log(`Server running at http://127.0.0.1:3001/`);
});
