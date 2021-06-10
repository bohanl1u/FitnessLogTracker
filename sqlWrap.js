'use strict'

const sql = require('sqlite3');
const util = require('util');

// old-fashioned database creation code 

// creates a new database object, not a 
// new database. 
const db = new sql.Database("activities.db");

// db.run("DROP TABLE ActivityTable");
// db.run("DROP TABLE UserTable");

// check if database exists
let cmd = " SELECT name FROM sqlite_master WHERE type='table' AND name='ActivityTable' ";

let cmd2 = " SELECT name FROM sqlite_master WHERE type='table' AND name='UserTable' ";

// Creates an ActivityTable.
db.get(cmd, function (err, val) {
  if (val == undefined) {
        console.log("No Activity database file - creating one");
        createActivityTable();
  } else {
        console.log("Activity Database file found");
  }
});

// Creates a UserTable to store profiles.
db.get(cmd2, function (err, val) {
  if (val == undefined) {
        console.log("No User database file - creating one");
        createUserTable();
  } else {
        console.log("User Database file found");
        //db.insertTestUserTable();
        //db.printUserTable();
  }
});

// called to create table if needed
function createActivityTable() {
  // explicitly declaring the rowIdNum protects rowids from changing if the 
  // table is compacted; not an issue here, but good practice
  const cmd = 'CREATE TABLE ActivityTable (rowIdNum INTEGER PRIMARY KEY, activity TEXT, date INTEGER, amount FLOAT, userId INTEGER)';
  db.run(cmd, function(err, val) {
    if (err) {
      console.log("ActivityTable Database creation failure",err.message);
    } else {
      console.log("Created ActivityTable database");
    }
  });
}

// Called to created User Table if needed.
// Stores Google userID and name
function createUserTable(){
  const cmd = 'CREATE TABLE UserTable (rowIdNum INTEGER PRIMARY KEY, userId INTEGER, firstName TEXT)';
  //const cmd = 'CREATE TABLE UserTable (userId INTEGER, firstName TEXT)';
  db.run(cmd, function(err, val) {
    if (err) {
      console.log("UserTable database creation failure",err.message);
    } else {
      console.log("Created UserTable database");
    }
  });
}


// wrap all database commands in promises
db.run = util.promisify(db.run);
db.get = util.promisify(db.get);
db.all = util.promisify(db.all);

// empty all data from db
db.deleteEverything = async function() {
  await db.run("delete from ActivityTable");
  await db.run("delete from UserTable");
  db.run("vacuum");
}

// Deletes only the UserTable with profiles.
db.deleteUsers = async function() {
  await db.run("delete from UserTable");
  db.run("vacuum");
}

db.insertTestUserTable = async function() {
  await db.run("insert into UserTable (userId, firstName) values (?,?)", ['123', 'Test']);
}

/*
Prints the table contents for debugging purposes. 
*/
db.printUserTable = async function() {
  var results = await db.get("select * from UserTable");
  console.log("UserTable results:", JSON.stringify(results));
}

db.printActivityTable = async function() {
  var results = await db.get("select * from ActivityTable");
  console.log("UserTable results:", JSON.stringify(results));
}

// allow code in index.js to use the db object
module.exports = db;