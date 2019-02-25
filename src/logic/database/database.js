let Promise = require('bluebird')
let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database(':memory:');

// db.serialize(() => {
//   db.run("CREATE TABLE lorem (info TEXT)");

//   let stmt = db.prepare("INSERT INTO lorem VALUES (?)");
//   for (let i = 0; i < 10; i++) {
//     stmt.run("Ipsum " + i);
//   }
//   stmt.finalize();

//   db.each("SELECT rowid AS id, info FROM lorem", (err, row) => {
//     console.log(row.id + ": " + row.info);
//   });
// });

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS drives (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        size TEXT
        )`);

    let stmt = db.prepare("INSERT INTO drives (name, size) VALUES (?, ?)");
    for (let i = 0; i < 10; i++) {
        stmt.run("NAME: " + i, "SIZE: " + i);
    }
    stmt.finalize();

    db.each("SELECT id, name, size FROM drives", (err, row) => {
        console.log([row.id, row.name, row.size]);
    });
});
db.close()

export default {
    saveDrives: async drives => {
        db.serialize(() => {

            let stmt = db.prepare("INSERT INTO lorem VALUES (?)");
            for (let i = 0; i < 10; i++) {
                stmt.run("Ipsum " + i);
            }
            stmt.finalize();
        });
        db.close();
    }
}