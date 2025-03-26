const express = require("express");
const cors = require("cors");

const app = express();
const db = require('./sqlConnection');


app.use(cors()); 
app.use(express.json()); 


app.get("/drs/drsDetails/:date", (req, res) => {
    const { date } = req.params;
    var sql = "select * from drsDetails where id = 1";
    db.query(sql).then(results => {
        console.log(results)
        return res.json({drs:results}); 
    })
});

app.post("/drs/createDrs", (req, res) => {
    // Convert JSON fields to strings
    const jsonFields = ["costaReading", "scratchCardDetails", "atmDetails", "balanceDetails"];
    
    // Convert JSON fields to JSON strings if they exist in req.body
    jsonFields.forEach((field) => {
        if (req.body[field]) {
            req.body[field] = JSON.stringify(req.body[field]);
        }
    });

    // Extract field names and values from req.body
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);

    // Construct SQL query dynamically
    const placeholders = fields.map(() => "?").join(", ");
    const sql = `INSERT INTO drsDetails (${fields.join(", ")}) VALUES (${placeholders})`;

    // Execute the query
    db.query(sql, values)
        .then((results) => {
            console.log("Insert Success:", results);
            return res.json({ success: true, drs: results });
        })
        .catch((err) => {
            console.error("Database Insert Error:", err);
            return res.status(500).json({ success: false, error: err.message });
        });
});



app.listen(3001,function(){
    console.log(`Server running at http://127.0.0.1:3001/`);
});
