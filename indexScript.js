/*
	Ryan Proffitt
	CS 290, Database Assignment
	7 June 2017
	This script will populate a basic webpage and allow
	users to track their exercises using a database.
*/
var express = require('express');
var mysql = require('./dbcon.js');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handelbars');
app.set('port', 3000);

function bindAddButton(){
	document.getElementById("addRow").addEventListener("click", function(event){
		document.getElementById("tester").text = "tested";
		console.log("better not show");
	});
	console.log("test");
}

app.get('/', function(req, res, next){
	var context = {};
	mysql.pool.query('SELECT * FROM todo', function(err, rows, fields){
		if(err){
			next(err);
			return;
		}
		context.results = JSON.stringify(rows);
		res.render('index', context);
	});
});

app.get('/insert', function(req, res, next){
	var context = {};
	mysql.pool.query('INSERT INTO todo (`name`) VALUES (?)', [req.query.c], function(err, result){
		if(err){
			next(err);
			return;
		}
		context.results = "Inserted ID " + result.insertId;
		res.render('index', context);
	});
});

app.get('/delete', function(req, res, next){
	var context = {};
	mysql.pool.query('DELETE FROM todo WHERE id=?', [req.query.c], function(err, result){
		if(err){
			next(err);
			return;
		}
		context.results = "Deleted " + result.changedRows + " rows.";
		res.render('index', context);
	});
});

app.get('/update', function(req, res, next){
	var context = {};
	mysql.pool.query('UPDATE todo SET name=?, done=?, due=? WHERE id=?', [req.query.id], function(err, result){
		if(err){
			next(err);
			return;
		}
		context.results = "Updated " + result.changedRows + " rows.";
		res.render('index', context);
	});
});

function createTable(){
	console.log(app.get());
}