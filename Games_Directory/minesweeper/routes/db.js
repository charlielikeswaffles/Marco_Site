const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db.sqlite3');

db.run(
	'CREATE TABLE IF NOT EXISTS playerscores (player TEXT, score INTEGER)'
);

exports.db = db;

exports.getHighScores = function(callback) {
	let sql = `SELECT * FROM playerscores GROUP BY player ORDER BY score ASC LIMIT 10`;
	db.all(sql, [], (err, rows) => {
		if (err) {
			throw err;
		}
		callback(err, rows);
	});
};

exports.addScore = function(player, score) {
	let sql = 'INSERT INTO playerscores(player, score) VALUES (?, ?) ';
	db.run(sql, [player, score], function(err) {
		if (err) console.log(err.message);
	});
};