const express        = require('express');
var cors             = require('cors');
var router           = express.Router();
const bodyParser     = require('body-parser');
const app            = express();
var mysql = require('mysql');

var multer  = require('multer')
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '.pdf');
  }
});
var upload = multer({ storage: storage })

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

var port = process.env.PORT || 3000;

var server = app.listen(port, function() {
	console.log('Express server listening on port ' + port);
});

app.use('/api', router);
app.use(cors());

router.get('/test_upload',  function(req, res) {
	  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write('<form action="http://localhost:3000/api/fileupload" method="post" enctype="multipart/form-data">');
  res.write('<input type="file" name="filetoupload"><br>');
  res.write('<input type="text" name="tenderId" value="adia"><br>');
  res.write('<input type="submit">');
  res.write('</form>');
  return res.end();
});

router.get('/make_contract', function(req, res) {

	var id_name = req.query.name
	console.log(id_name);

	code = fs.readFileSync('./contracts/Voting.sol').toString()
	compiledCode = solc.compile(code)
	abipre = compiledCode.contracts[':Voting'].interface;
	abiDefinition = JSON.parse(compiledCode.contracts[':Voting'].interface)
	VotingContract = web3.eth.contract(abiDefinition)
	byteCode = compiledCode.contracts[':Voting'].bytecode
	deployedContract = VotingContract.new(['Rama','Nick','Jose'],{data: byteCode, from: web3.eth.accounts[0], gas: 4700000})

	setTimeout(function () {
		var a = deployedContract.address
		var link = 'test_link';
		console.log(a)
		contractInstance = VotingContract.at(deployedContract.address);
		var insert_sql = "insert into tenders (tenderId , address , link) values ('" + id_name + "', '" + a + "', '" + link + "')";
		var new_obj = [id_name, a, link];
		console.log(insert_sql);
		con.query(insert_sql, function (err, result) {
		    if (err) throw err;
		    console.log("Number of records inserted: " + result.affectedRows);
		  });

		glo_hash[id_name] = {
							address: a, 
							abiDefinition: JSON.parse(compiledCode.contracts[':Voting'].interface), 
							bytecode: byteCode
						};
    	res.json(glo_hash[req.query.name]);   
	}, 1000);
});

router.get('/get_contract', function(req, res) {
	var id_name = req.query.name;
	var get_sql = "select * from tenders where tenderId='" + id_name + "'";
	con.query(get_sql, function (err, result) {
		    if (err) throw err;
		    console.log("Number of records inserted: " + result.affectedRows);
		  	console.log(result);
			res.json(result);
		  });

});

router.post('/fileupload', upload.single('filetoupload'),  function(req, res, next){
	console.log(req.file);
	console.log(req.body);
	var tenderId = req.body.tenderId;
	var fileName = req.file.path;
	var update_sql = "update tenders set link='" + fileName + "' where tenderId='" + tenderId + "'"; 
	con.query(update_sql, function (err, result) {
		    if (err) throw err;
		    console.log("Number of records inserted: " + result.affectedRows);
		  });
	return res.end('File done');
});
