//Initiallising node modules
var express = require("express");
const cors = require("cors");
var bodyParser = require("body-parser");
var sql = require("mssql");
const path = require("path");
var form = require("multer");
const { json } = require("body-parser");

var app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

const ip = "127.0.0.1";
const port = process.env.PORT || 4040;
const studentRouter = express.Router();

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(bodyParser.text({ type: "text/html" }));

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

//CORS Middleware
app.use(function (req, res, next) {
  //Enabling CORS
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization"
  );
  next();
});

//Setting up server
var server = app.listen(process.env.PORT || 4040, function () {
  var port = server.address().port;
  console.log("App now running on port", port);
  console.log(`server running at http://${ip}:${port}/`);
});

//Initialising connection string
var dbConfig = {
  user: "sa",
  password: "11Jan02*",
  server: "WINDOWS-4QT2NDK",
  database: "Node",
  synchronize: true,
  trustServerCertificate: true,
  port: 1433,
  dialectOptions: {
    instanceName: "sqlexpress",
  },
};

var items = [];
var item = [];
//var items2 = [];
//var item2 = [];

//Function to connect to database and execute query
//GET ALL ACTIVE USERS FOR PATHWAYS
studentRouter.route("/").get((req, res) => {
  var query = "select * from Studentinfo";
  sql.connect(dbConfig, function (err) {
    if (err) console.log(err);
    // create Request object
    var request = new sql.Request();
    // query to the database and get the records
    request.query(query, function (err, recordset) {
      if (err) console.log(err);
      for (let [key, value] of Object.entries(recordset)) {
        //console.log('key: ' + key.json);
        if (key === "recordset") {
          items = [];
          for (var i = 0; i < value.length; i++) {
            item = [];
            //console.log('id: ' + value[i].ID + '  name: ' + value[i].Name + '   age: ' + value[i].Age );
            item["id"] = value[i].ID;
            item["name"] = value[i].Name;
            item["age"] = value[i].Age;
            items.push(item);
          }
        } else {
          //console.log('not a record');
        }
      }
      console.log("--------------------");
      res.render("index", { title: "items", items: items });
      res.end;
    });
  });
});

studentRouter.route("/user/:id").get((req, res) => {
  var userId = req.params.id;
  var query = "SELECT * FROM Studentinfo WHERE ID = @id";
  sql.connect(dbConfig, function (err) {
    if (err) {
      console.error(err);
      return res.status(500).send("Database connection error");
    }
    var request = new sql.Request();
    request.input("id", sql.VarChar, userId);
    request.query(query, function (err, result) {
      if (err) {
        console.error(err);
        return res.status(500).send("Query execution error");
      }
      if (result.recordset.length > 0) {
        res.render("view", {
          title: "User Details",
          user: result.recordset[0],
        });
      } else {
        res.status(404).send("User not found");
      }
    });
  });
});

// Edit user page
studentRouter.route("/user/edit/:id").get((req, res) => {
  var userId = req.params.id;
  var query = "SELECT * FROM Studentinfo WHERE ID = @id";
  sql.connect(dbConfig, function (err) {
    if (err) {
      console.error(err);
      return res.status(500).send("Database connection error");
    }
    var request = new sql.Request();
    request.input("id", sql.VarChar, userId);
    request.query(query, function (err, result) {
      if (err) {
        console.error(err);
        return res.status(500).send("Query execution error");
      }
      if (result.recordset.length > 0) {
        res.render("edit", { title: "Edit User", user: result.recordset[0] });
      } else {
        res.status(404).send("User not found");
      }
    });
  });
});

// Delete user page
studentRouter.route("/user/delete/:id").get((req, res) => {
  var userId = req.params.id;
  var query = "SELECT * FROM Studentinfo WHERE ID = @id";
  sql.connect(dbConfig, function (err) {
    if (err) {
      console.error(err);
      return res.status(500).send("Database connection error");
    }
    var request = new sql.Request();
    request.input("id", sql.VarChar, userId);
    request.query(query, function (err, result) {
      if (err) {
        console.error(err);
        return res.status(500).send("Query execution error");
      }
      if (result.recordset.length > 0) {
        res.render("delete", {
          title: "Delete User",
          user: result.recordset[0],
        });
      } else {
        res.status(404).send("User not found");
      }
    });
  });
});
app.use("/", studentRouter);

//POST API
app.post("/api/user", function (req, res) {
  var query =
    "INSERT INTO Studentinfo (Name, Age) VALUES ('" +
    req.body.name +
    "','" +
    req.body.age +
    "')";
  sql.connect(dbConfig, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(query, function (err, recordset) {
      if (err) console.log(err);
      res.send("User added successfully");
    });
  });
});

// // DELETE API
//  app.delete("/api/user /:id", function(req , res){
//                 var query = "DELETE FROM [user] WHERE Id=" + req.params.id;
//                 executeQuery (res, query);
// });

//});
