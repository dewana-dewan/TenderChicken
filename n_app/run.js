const express        = require('express');
var router           = express.Router();
// const MongoClient    = require('mongodb').MongoClient;
const bodyParser     = require('body-parser');
const app            = express();
// var mongoose = require('mongoose');
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "codebuildhack",
  database: "hint_test"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

var glo_hash         = {};

Web3 = require('web3');
web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
var fs = require("fs");
solc = require('solc');


// mongoose.connect('mongodb+srv://dewan:dewan123@hint1-aytbe.mongodb.net/test')
// var TenderSchema = new mongoose.Schema({  
//   name: String,
//   address: String,
//   abi: String,
//   bytecode: String,
//   link: String
// });
// mongoose.model('Tender', TenderSchema);
// module.exports = mongoose.model('Tender');

var port = process.env.PORT || 3000;

var server = app.listen(port, function() {
	console.log('Express server listening on port ' + port);
});

app.use('/api', router);

router.get('/make_contract', function(req, res) {

	var id_name = req.query.name
	console.log(id_name);

	code = fs.readFileSync('./contracts/Voting.sol').toString()
	compiledCode = solc.compile(code)
	abipre = compiledCode.contracts[':Voting'].interface;
	abiDefinition = JSON.parse(abipre)
	VotingContract = web3.eth.contract(abiDefinition)
	byteCode = compiledCode.contracts[':Voting'].bytecode
	deployedContract = VotingContract.new(['Rama','Nick','Jose'],{data: byteCode, from: web3.eth.accounts[0], gas: 4700000})

	setTimeout(function () {
		var a = deployedContract.address
		var link = 'test_link';
		console.log(a)
		contractInstance = VotingContract.at(deployedContract.address);
		// console.log(typeof(abipre), abipre, abipre.toString());
		var insert_sql = 'insert into tenders (tenderId , address , link) values ?';
		var new_obj = [id_name, a, link];
		console.log(new_obj);
		con.query(insert_sql, [new_obj], function (err, result) {
		    if (err) throw err;
		    console.log("Number of records inserted: " + result.affectedRows);
		  });
		// Tender.create({
		// 	  name: id_name,
		// 	  address: a,
		// 	  abi: JSON.parse(compiledCode.contracts[':Voting'].interface),
		// 	  bytecode: byteCode,
		// 	  link: 'String'
		// })
		glo_hash[req.query.name] = {
							address: a, 
							abiDefinition: JSON.parse(compiledCode.contracts[':Voting'].interface), 
							bytecode: byteCode
						};
    	res.json(glo_hash[req.query.name]);   
	}, 1000);
});
