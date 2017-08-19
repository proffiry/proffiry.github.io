/*
	Ryan Proffitt and Colton McDavid
	CS 340, Final Project
	18 Aug 2017
	This is serverside code for our final project, Fresh Direct. This code is an API that allows our clientside JS to get information
	from our database. The code is split into 4 sections: Customer, Producer, Product, and Cart functionality.

	Naming Conventions:
		All serverside code utilizes connected words for functions and variable names, i.e. 'exampleName'
			Functions will start with either customer, cart, producer, product, or productId for quick identification of which table the function primarily works with
		All database side code utilizes words connected with an underscore for functions and variable names, i.e. product_id
*/
var express = require('express');
var mysql = require('./dbcon.js');
var cors = require('cors');

var app = express();
var bodyParser = require('body-parser');
var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 65512);

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(cors());

function sleep(miliseconds) {
   var currentTime = new Date().getTime();

   while (currentTime + miliseconds >= new Date().getTime()) {
   }
}

/*
app.get('/',function(req,res,next){
	res.render('index');
});
*/


//----------------------------------------------------------------------------------------------------------------------------
/*
Customer Profile Code
Sign up, login, edit personal information
*/

/*
Customer Signup
Parameters: string fname, string lname, string email, string password, string city, string state
Returns: true if profile creation is successful, false if not
Notes: Only creates profile if the submitted email is not already claimed
*/
app.post('/customerSignup',function(req,res){
	mysql.pool.query("SELECT * FROM customer WHERE customer.email = \'" + req.body.email + "\';", function(err, response1){
		if(response1.length == 0){
			var customer = "INSERT INTO customer ([fname], [lname], [email], [password], [city], [state]) VALUES (\'" 
					+ req.body.fname 
					+ "\', \'" + req.body.lname 
					+ "\', \'" + req.body.email 
					+ "\', \'" + req.body.password 
					+ "\', \'" + req.body.city 
					+ "\', \'" + req.body.state 
					+ "\')";
			mysql.pool.query(customer, function(err, response2){
				if(err){
					console.log(err);
					res.send('false');
				}else{
					res.send('true');
					console.log("ADDED NEW CUSTOMER PROFILE");
				}
			});
		}else{
			res.send('false');
		}
	});
});

/*
Customer Login
Parameters: string email, string password
Returns: returns a table of the users info if login successful, false if not
Notes: Only logs in if the correct email and password pair are submitted
*/
app.post('/customerLogin', function(req,res,next){
	mysql.pool.query("SELECT customer_id, fname, lname, email, password, city, state FROM customer WHERE email = \'" + req.body.email + "\' AND password = \'" + req.body.password + "\'\;", function(err, response1){
		if(err){
			console.log(err);
			res.send('false');
		}else{
			if(response1.length == 0){
				res.send('false');
			}else{
				res.send(response1);
			}
		}
	});
});

/*
Customer Edit Info
Parameters: int customer_id, string fname, string lname, string email, string city, string state
Returns: True if edit successful, false otherwise
Notes: Assumes customer is already logged in
*/
app.post('/customerEdit', function(req,res,next){
	mysql.pool.query("SELECT * FROM customer WHERE customer.customer_id = \'" + req.body.customer_id + "\';", function(err, response1){
		if(response1.length != 0){
			var str = "";
			var flag = false;
			var post = [
				req.body.fname, 
				req.body.lname,
				req.body.city, 
				req.body.state
				];
			var matchingQuery = [
				"fname = ", 
				"lname = ",
				"city = ", 
				"state = "
			];
			for(var i = 0; i < 4; i++){
				if(post[i] != ""){
					flag = true;
					if(i != 0){
						str += ', '
					}
					str += matchingQuery[i] + "\'" +  post[i] + "\'";
				}
			}
			if(flag){
				str = "UPDATE customer SET " + str + " WHERE customer_id = " + req.body.customer_id;
				mysql.pool.query(str, function(err, req){
					if(err){
						res.send('false');
					}else{
						res.send('true');
					}
				});
			}else{
				res.send('false');
			}
		}else{
			res.send('false');
		}
	});
});



//----------------------------------------------------------------------------------------------------------------------------
/*
Producer Profile Code
Sign up, login, edit account info, add product, remove product, edit product information
*/

/*
Producer Signup
Parameters: string company_name, string email, string password, string city, string state
Returns: true if profile creation is successful, false if not
Notes: Only creates profile if the submitted email is not already claimed
*/
app.post('/producerSignup',function(req,res){
	mysql.pool.query("SELECT * FROM producer WHERE producer.email = \'" + req.body.email + "\';", function(err, response1){
		if(response1.length == 0){
			var producer = "INSERT INTO producer (company_name, email, password, city, state) VALUES (\'" 
					+ req.body.company_name
					+ "\', \'" + req.body.email 
					+ "\', \'" + req.body.password 
					+ "\', \'" + req.body.city 
					+ "\', \'" + req.body.state 
					+ "\')";
			mysql.pool.query(producer, function(err, response2){
				if(err){
					console.log(err);
					res.send('false');
				}else{
					res.send('true');
					console.log("ADDED NEW PRODUCER PROFILE");
				}
			});
		}else{
			res.send('false');
		}
	});
});

/*
Producer Login
Parameters: string email, string password
Returns: returns user info if successful, false if not
Notes: Only logs in if the correct email and password pair are submitted
*/

app.post('/producerLogin', function(req,res,next){
	mysql.pool.query("SELECT producer_id, company_name, email, password, city, state FROM producer WHERE email = \'" + req.body.email + "\' AND password = \'" + req.body.password + "\';", function(err, response1){
		if(err){
			console.log(err);
			res.send('false');
		}else{
			if(response1.length == 0){
				res.send('false');
			}else{
				res.send(response1);
			}
		}
	});
});

/*
Producer Edit Info
Parameters: int producer_id, string company_name, string email, string city, string state
Returns: True if edit successful, false otherwise
Notes: Assumes producer is already logged in
*/

app.post('/producerEdit', function(req,res,next){
	mysql.pool.query("SELECT * FROM producer WHERE producer.producer_id = \'" + req.body.producer_id + "\';", function(err, response1){
		if(response1.length != 0){
			var str = "";
			var flag = false;
			var post = [
				req.body.company_name,
				req.body.city, 
				req.body.state
				];
			var matchingQuery = [
				"company_name = ",
				"city = ", 
				"state = "
			];
			for(var i = 0; i < 3; i++){
				if(post[i] != ""){
					flag = true;
					if(i != 0){
						str += ', '
					}
					str += matchingQuery[i] + "\'" +  post[i] + "\'";
				}
			}
			if(flag){
				str = "UPDATE producer SET " + str + " WHERE producer_id = " + req.body.producer_id;
				mysql.pool.query(str, function(err, req){
					if(err){
						res.send('false');
					}else{
						res.send('true');
					}
				});
			}else{
				res.send('false');
			}
		}else{
			res.send('false');
		}
	});
});


//----------------------------------------------------------------------------------------------------------------------------
/*
Product Code
Group, Search, and Specific, Add, Remove
*/

/*
Product Range
Parameters: int startId, int endId
Returns: JSON of products, false otherwise
Notes: Returns a range of products from starting ID to ending ID
*/
app.post('/productRange', function(req,res,next){
	var startId = req.body.startId;
	var endId = req.body.endId;
	mysql.pool.query("SELECT product_id, name, price, description FROM product WHERE product_id >= " + startId + " AND product_id <= " + endId, function(err, response1){
		if(err){
			console.log(err);
			res.send('false');
		}else{
			res.send(response1);
		}
	});
});

/*
Product Search
Parameters: string searchStr
Returns: JSON of products' info, false otherwise
Notes: Returns a range of products from starting ID to ending ID
*/
app.post('/productSearch', function(req,res,next){
	var searchString = req.body.searchStr;
	mysql.pool.query("SELECT product_id, name, price, description FROM product WHERE name LIKE \'%" + searchString + "%\' OR description LIKE \'%" + searchString + "%\'", function(err, response1){
		if(err){
			console.log(err);
			res.send('false');
		}else{
			res.send(response1);
		}
	});
});

/*
Product Specific Info Getter
Parameters: int specificId
Returns: JSON of that products info, false otherwise
*/
app.post('/productSpecific', function(req,res,next){
	var id = parseInt(req.body.specificId);
	mysql.pool.query("SELECT product_id, fk_producer_id, fk_type_id, in_stock, name, description, price FROM product WHERE product_id = " + id, function(err,response1){
		if(err){
			console.log(err);
			res.send('false');
		}else{
			res.send(response1);
		}
	});
});

/*
Product Add
Parameters: int producerId, int typeId, int numInStock, string name, string description, float price
Returns: true if it worked, false otherwise
*/
app.post('/productAdd', function(req,res,next){
	var productAddStr = "INSERT INTO product (fk_producer_id, fk_type_id, in_stock, name, description, price) VALUES (" +
		req.body.producerId + ", " +
		req.body.typeId + ", " +
		req.body.numInStock + ", \'" +
		req.body.name + "\', \'" +
		req.body.description + "\', " +
		req.body.price + ");";
	mysql.pool.query(productAddStr, function(err,response1){
		if(err){
			console.log(err);
			res.send('false');
		}else{
			res.send('true');
		}
	});
});

/*
Product Remove
Parameters: int productId
Returns: true if it worked, false otherwise
*/
app.post('/productRemove', function(req,res,next){
	var productRemoveStr = "DELETE FROM product WHERE product.product_id=" + req.body.productId + ";";
	mysql.pool.query(productRemoveStr, function(err,response1){
		if(err){
			console.log(err);
			res.send('false');
		}else{
			res.send('true');
		}
	});
});


//----------------------------------------------------------------------------------------------------------------------------
/*
Cart Code
Add Item, Remove Item, View, Change quantity, checkout
*/

/*
Cart Add Item
Parameters: int customerId, int productId, int quantity
Returns: ture if successful, false otherwise
*/
app.post('/cartAdd', function(req,res,next){
	mysql.pool.query("SELECT * FROM cartItem WHERE cartItem.fk_customer_id=" + req.body.customerId + " AND cartItem.fk_product_id=" + req.body.productId, function(err, response1){
		if(response1.length != 0){
			mysql.pool.query("UPDATE cartItem SET cartItem.quantity=(quantity+1) WHERE cartItem.fk_customer_id=" + req.body.customerId + " AND cartItem.fk_product_id=" + req.body.productId + ";", function(err, response2){
				if(err){
					res.send('false, failed to update');
				}else{
					res.send('true');
				}
			});
		}else{
			mysql.pool.query("INSERT INTO cartItem (fk_customer_id, fk_product_id, quantity) VALUES (" + req.body.customerId + ", " + req.body.productId + ", " + req.body.quantity + ");", function(err, response3){
				if(err){
					console.log(err);
					res.send('false, failed to add');
				}else{
					res.send('true');
				}
			});
		}
	});
});

/*
Cart Remove Item
Parameters: int customerId, int productId
Returns: true if successful, false if an error
Notes: Assumes item is in cart, does not break anything if the item IS NOT in the cart though
*/
app.post('/cartRemove', function(req,res,next){
	mysql.pool.query("DELETE FROM cartItem WHERE cartItem.fk_customer_id=" + req.body.customerId + " AND cartItem.fk_product_id=" + req.body.productId + ";", function(err, response1){
		if(err){
			console.log(err);
			res.send('false');
		}else{
			res.send('true');
		}
	});
});

/*
Cart View
Parameters: int customerId
Returns: true if successful, false if an error
*/
app.post('/cartView', function(req,res,next){
	var qry = "SELECT product.product_id, product.name, product.description, product.price, cartItem.quantity FROM (cartItem INNER JOIN product ON cartItem.fk_product_id=product.product_id AND cartItem.fk_customer_id=" + req.body.customerId +");";
	mysql.pool.query(qry, function(err, response1){
		if(err){
			res.send(response1);
		}else{
			res.send(response1);
		}
	});
});

/*
Cart Change Quantity
Parameters: int customerId, int productId, int quantity
Returns: true if successful, false if error
Notes: Assumes item is in cart, does not break anything if the item IS NOT in the cart though
*/

app.post('/cartChangeQuantity', function(req,res,next){
	mysql.pool.query("UPDATE cartItem SET cartItem.quantity=" + req.body.quantity + " WHERE cartItem.fk_customer_id=" + req.body.customerId + " AND cartItem.fk_product_id=" + req.body.productId + ";", function(err, response1){
		if(err){
			console.log(err);
			res.send('false');
		}else{
			res.send('true');
		}
	});
});

/*
Cart Checkout
Parameters: int customerId
Returns: If some products have a requested quantity greater than the amount in stock, then it returns a table containing the cart info and product info (quantity requested, number in stock, etc) for each respective product
	 so that the clientside can alert the customer to the problem. If the operation is successful, returns a table containing all checked out products info along with the (quantity * price) AS rowTotalPrice for each. Returns
	 an empty table if customer has no items in their cart.
Notes: Just look for whether rowTotalPrice is present in the returned table, if it isn't, then the table you are dealing with is the list of cart products with quantities higher than number in stock
*/
app.post('/cartCheckout', function(req,res,next){
	var id = "" + req.body.customerId;
	mysql.pool.query("SELECT * FROM (cartItem INNER JOIN product ON cartItem.fk_product_id=product.product_id AND cartItem.fk_customer_id=" + id + ") WHERE cartItem.quantity > product.in_stock;", function(err, response1){
		if(err){
			console.log(err);
			res.send('false');
		}else if (response1.length != 0){
			res.send(response1);
		}else{
			mysql.pool.query("SELECT *, round(cartItem.quantity * product.price, 2) AS rowTotalPrice FROM (cartItem INNER JOIN product ON cartItem.fk_product_id=product.product_id) WHERE cartItem.fk_customer_id=" + id + ";", function(err, response2){
				if(err){
					console.log(err);
					res.send('false');
				}else{
					res.send(response2);
					for(var i = 0; i < response2.length; i++){
						var productToUpdateValue = response2[i].quantity;
						var productToUpdate = response2[i].fk_product_id;
						mysql.pool.query("UPDATE product SET product.in_stock=(product.in_stock - " + productToUpdateValue + ") WHERE product.product_id=" + productToUpdate + ";");
					}
					mysql.pool.query("DELETE FROM cartItem WHERE cartItem.fk_customer_id=" + id + ";", function(err, response4){
						if(err){
							console.log(err);
							res.send('false');
						}
					});
				}
			});
		}
	});
});



//----------------------------------------------------------------------------------------------------------------------------
/*Database Maintenance Code
DO NOT USE unless you want to wipe the whole database...
*/

app.post('/dropAllTables', function(req,res,next){
	var errorFlag = false;
	for(var i = 0; i < 3; i++){
		mysql.pool.query("DROP TABLE IF EXISTS cartItem;", function(err, response2){
			if(err){
				res.send('false');
				errorFlag = true;
			}
		});
		mysql.pool.query("DROP TABLE IF EXISTS product;", function(err, response1){
			if(err){
				res.send('false');
				errorFlag = true;
			}
		});
		mysql.pool.query("DROP TABLE IF EXISTS producer;", function(err, response3){
			if(err){
				res.send('false');
				errorFlag = true;
			}
		});
		mysql.pool.query("DROP TABLE IF EXISTS customer;", function(err, response4){
			if(err){
				res.send('false');
				errorFlag = true;
			}
		});
		mysql.pool.query("DROP TABLE IF EXISTS productType;", function(err, response5){
			if(err){
				res.send('false');
				errorFlag = true;
			}
		});
	}
	if(!errorFlag){
		res.send('TABLES DROPPED');
	}
});

app.post('/createProductTypeTable', function(req,res,next){
	var createProductTypeStr = "CREATE TABLE IF NOT EXISTS productType(type_id INT PRIMARY KEY AUTO_INCREMENT, " +
		"type_name VARCHAR(255) NOT NULL);";
	mysql.pool.query(createProductTypeStr, function(err, response1){
		if(err){
			res.send('false');
		}else{
			res.send("CREATED PRODUCT TYPE TABLE");
		}
	});
});

app.post('/createCustomerTable', function(req,res,next){
	var createCustomerTableStr = "CREATE TABLE IF NOT EXISTS  customer(" +
		"customer_id INT PRIMARY KEY AUTO_INCREMENT," +
		"fname VARCHAR(255) NOT NULL," +
		"lname VARCHAR(255) NOT NULL," +
		"email VARCHAR(255) NOT NULL," +
		"password VARCHAR(255) NOT NULL," +
		"state VARCHAR(255) NOT NULL," +
		"city VARCHAR(255) NOT NULL);";
	mysql.pool.query(createCustomerTableStr, function(err, response2){
		if(err){
			res.send('false');
		}else{
			res.send("CREATED CUSTOMER TABLE");
		}
	});
});

app.post('/createProducerTable', function(req,res,next){
	var createProducerTableStr = "CREATE TABLE IF NOT EXISTS  producer(" +
		"producer_id INT PRIMARY KEY AUTO_INCREMENT," +
		"company_name VARCHAR(255) NOT NULL," +
		"email VARCHAR(255) NOT NULL," +
		"password VARCHAR(255) NOT NULL," +
		"state VARCHAR(255) NOT NULL," +
		"city VARCHAR(255) NOT NULL);";
	mysql.pool.query(createProducerTableStr, function(err, response3){
		if(err){
			res.send('false');
		}else{
			res.send("CREATED PRODUCER TABLE");
		}
	});
});

app.post('/createProductTable', function(req,res,next){
	var createProductTableStr = "CREATE TABLE IF NOT EXISTS product(" +
		"product_id INT PRIMARY KEY AUTO_INCREMENT," +
		"fk_producer_id INT NOT NULL," +
		"fk_type_id INT NOT NULL," +
		"in_stock INT NOT NULL," +
		"name VARCHAR(255) NOT NULL," +
		"description VARCHAR(255) NOT NULL," +
		"price FLOAT NOT NULL," +
		"FOREIGN KEY (fk_producer_id) REFERENCES producer (producer_id)," +
		"FOREIGN KEY (fk_type_id) REFERENCES productType (type_id));";
	mysql.pool.query(createProductTableStr, function(err, response4){
		if(err){
			res.send('false');
		}else{
			res.send('CREATED PRODUCT TABLE');
		}
	});
});

app.post('/createCartItemTable', function(req,res,next){
	var createCartItemTableStr = "CREATE TABLE IF NOT EXISTS cartItem(fk_customer_id INT NOT NULL, " +
			"fk_product_id INT NOT NULL, " +
			"quantity INT NOT NULL, " +
			"FOREIGN KEY (fk_customer_id) REFERENCES customer (customer_id), " +
			"FOREIGN KEY (fk_product_id) REFERENCES product (product_id));";
		mysql.pool.query(createCartItemTableStr, function(err, response5){
			if(err){
				res.send('false');
			}else{
				res.send("CREATED CART TABLE");
			}
		});
});



//----------------------------------------------------------------------------------------------------------------------------
/*
Error/Alert Code
*/
app.use(function(req,res){
  res.status(404);
  res.send('404 Error');
  //res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.send('500 error');
  //res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});