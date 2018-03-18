const express        = require('express');
var cors             = require('cors');
var router           = express.Router();
const bodyParser     = require('body-parser');
const app            = express();
var path = require ('path');
app.use(express.static(__dirname+'/public'));

var mustacheExpress = require('mustache-express');
console.log(express.static(path.join(__dirname + '.../app')));
app.use(express.static(path.join(__dirname + '.../app')));
var dir = __dirname;
dir = dir.replace('/n_app', '/app');
app.use(express.static('dir' + '/img')); // you can change '/views' to '/public',
app.engine('html', mustacheExpress());
app.set('view engine', 'mustache');
app.use(bodyParser.urlencoded({ extended: true }));
var mysql = require('mysql');


var glo_hash = {};
var pel_hash = {};
var tender_apps = [];
var tender_app_count = 0;
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
  password: "iiita123",
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

router.get('/tender_display', function(req, res) {
	var dir = __dirname;
	dir = dir.replace('/n_app', '/app');
	res.sendFile(dir + '/tender_display.html');
});
router.get('/tender_display_getinfo', function(req, res) {
	var tenderId = req.query.tenderId;	
	var ans = pel_hash[tenderId];

	console.log(pel_hash, ans, tenderId);
	if (!ans) {
		ans = false
	}
	else{
		var get_sql = "select link from tenders where tenderId='" + ans.title.toString() + "' LIMIT 1";
		
		con.query(get_sql, function (err, result) {
		    if (err) throw err;
		    console.log(result);
		    console.log(result[0].link);
		    ans['link_add'] = result[0].link;
		    console.log("Number of records inserted: " + result.affectedRows);
	  	});
	}
	res.json(ans);
});

router.post('/submit_contract', function(req, res) {
	console.log(req.body);
	var ans = req.body;
	pel_hash[ans.title.toString()] = ans;
	console.log('in submit contract', pel_hash);
	res.redirect('/api/make_contract?name=' + ans.title);
});

router.get('/get_abi', function(req, res) {

	code = fs.readFileSync('./contracts/bid.sol').toString()
	console.log("heeee")
	compiledCode = solc.compile(code)
	abipre = compiledCode.contracts[':bid'].interface;
	abiDefinition = JSON.parse(compiledCode.contracts[':bid'].interface)
	res.json(abiDefinition);

});

router.get('/make_contract', function(req, res) {

	var id_name = req.query.name
	console.log(req.query, req.body);

	code = fs.readFileSync('./contracts/bid.sol').toString()
	compiledCode = solc.compile(code)
	abipre = compiledCode.contracts[':bid'].interface;
	abiDefinition = JSON.parse(compiledCode.contracts[':bid'].interface)
	bidContract = web3.eth.contract(abiDefinition)
	byteCode = compiledCode.contracts[':bid'].bytecode
	deployedContract = bidContract.new({data: byteCode, from: web3.eth.accounts[0], gas: 4700000})

	setTimeout(function () {
		var a = deployedContract.address
		var link = 'test_link';
		console.log(a)
		contractInstance = bidContract.at(deployedContract.address);
		var insert_sql = "insert into tenders (tenderId , address , link) values ('" + id_name + "', '" + a + "', '" + link + "')";
		var new_obj = [id_name, a, link];
		console.log(insert_sql);
		con.query(insert_sql, function (err, result) {
		    if (err) throw err;
		    console.log("Number of records inserted: " + result.affectedRows);
		  });

		glo_hash[id_name] = {
							address: a, 
							abiDefinition: JSON.parse(compiledCode.contracts[':bid'].interface), 
							bytecode: byteCode
						};
    	res.redirect('/api/upload_tender?tenderId=' + id_name);   
	}, 1000);
});

router.get('/getContract', function(req, res) {
	var dir = __dirname;
	dir = dir.replace('/n_app', '/app');
	console.log(dir + '/upload_tender.html');
	res.sendFile(dir + '/hash.html');
	// res.sendFile('./app/hash.html');
})



router.get('/upload_tender', function(req, res) {
	var tendorId = req.query.name;
	var dir = __dirname;
	dir = dir.replace('/n_app', '/app');
	console.log(dir + '/upload_tender.html');
	res.sendFile(dir + '/upload_tender.html');
	// res.sendFile('./app/hash.html');
})

router.get('/get_contract', function(req, res) {
	var id_name = req.query.name;
	var get_sql = "select * from tenders where tenderId='" + id_name + "'";
	con.query(get_sql, function (err, result) {
		    if (err) throw err;
		    console.log("Number of records inserted: " + result.affectedRows);
		  	console.log(result[0].address);
			res.json(result[0].address);
		  });



});

router.post('/fileupload', upload.single('filetoupload'),  function(req, res, next){
	console.log(req.file);
	console.log(req.body);
	var tenderId = req.body.tenderId;
	var type = req.body.type_upload;
	var fileName = req.file.path;
	if(type == 'tender') {
		var update_sql = "update tenders set link='" + fileName + "' where tenderId='" + tenderId + "'"; 
		con.query(update_sql, function (err, result) {
			    if (err) throw err;
			    console.log("Number of records inserted: " + result.affectedRows);
			  });
		res.redirect('/api/success?tenderId=' + tenderId);
	}
});

router.post('/fileupload', upload.single('filetoupload'),  function(req, res, next){
	console.log(req.file);
	console.log(req.body);
	var tenderId = req.body.tenderId;
	var type = req.body.type_upload;
	var fileName = req.file.path;
	if(type == 'tender') {
		var update_sql = "update tenders set link='" + fileName + "' where tenderId='" + tenderId + "'"; 
		con.query(update_sql, function (err, result) {
			    if (err) throw err;
			    console.log("Number of records inserted: " + result.affectedRows);
			  });
		res.redirect('/success' + tenderId);
	}
});

router.get('/success', function(req, res) {
	var dir = __dirname;
	dir = dir.replace('/n_app', '/app');
	console.log(dir + '/operation_succesful.html');
	res.sendFile(dir + '/operation_succesful.html');

});


router.get('/submit_application_hash', function(req, res) {
	var tenderId = req.body.tenderId;

	var dir = __dirname;
	dir = dir.replace('/n_app', '/app');
	console.log(dir + '/hash.html');
	res.sendFile(dir + '/hash.html');
});

router.get('/submit_application_hash_success', function(req, res) {
	console.log(req);
	console.log(req.query);

	var tenderId = req.query['tenderId'];
	var file_hash = req.query['filekahash'];

	console.log(file_hash);

	tender_apps[tender_app_count] = file_hash;
	tender_app_count++;

	console.log(typeof(tender_apps), typeof(tender_apps[tenderId]));
	var dir = __dirname;
	dir = dir.replace('/n_app', '/app');
	console.log(dir + '/operation_succesful.html');
	res.sendFile(dir + '/operation_succesful.html');
});

router.get('/submit_application_doc', function(req, res) {
	var dir = __dirname;
	dir = dir.replace('/n_app', '/app');
	console.log(dir + '/upload_application.html');
	res.sendFile(dir + '/upload_application.html');
});

router.get('/verify', function(req, res) {
	var tenderId = req.query['tenderId'];

	for (var i = tender_apps.length - 1; i >= 0; i--) {
		console.log('-----',tender_apps[i], tenderId );
		if(tender_apps[i] == tenderId){
			console.log('we have amatch');
			return res.end('true');
		}
	}
	return res.end('false');
});

router.get('/tender_apply_hash', function(req, res) {
	tenderId = req.params.tenderId;
	var dir = __dirname;
	dir = dir.replace('/n_app', '/app');
	console.log(dir + '/hash.html');
	res.sendFile(dir + '/hash.html');

});

router.get('/tender_apply_doc', function(req, res) {
	tenderId = req.params.tenderId;
	var dir = __dirname;
	dir = dir.replace('/n_app', '/app');
	console.log(dir + '/hash.html');
	res.sendFile(dir + '/hash.html');

});

router.get('/all_tenders/:id', function(req, res) {
	id = req.params.id;
	var dir = __dirname;
	
	dir = dir.replace('/n_app', '/uploads');
	res.sendFile(dir + '/' + id);
});

router.get('/do_transaction', function(req, res) {
	Web3 = require('web3');
	web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));


	var abidef = [ { constant: true,
       inputs: [Object],
       name: 'totalVotesFor',
       outputs: [Object],
       payable: false,
       stateMutability: 'view',
       type: 'function' },
     { constant: true,
       inputs: [Object],
       name: 'validCandidate',
       outputs: [Object],
       payable: false,
       stateMutability: 'view',
       type: 'function' },
     { constant: true,
       inputs: [Object],
       name: 'votesReceived',
       outputs: [Object],
       payable: false,
       stateMutability: 'view',
       type: 'function' },
     { constant: true,
       inputs: [Object],
       name: 'candidateList',
       outputs: [Object],
       payable: false,
       stateMutability: 'view',
       type: 'function' },
     { constant: false,
       inputs: [Object],
       name: 'voteForCandidate',
       outputs: [],
       payable: false,
       stateMutability: 'nonpayable',
       type: 'function' },
     { inputs: [Object],
       payable: false,
       stateMutability: 'nonpayable',
       type: 'constructor' } ];

    var VotingContract = web3.eth.contract(abidef);
    var byteCode = '6060604052341561000f57600080fd5b6040516103da3803806103da833981016040528080518201919050508060019080519060200190610041929190610048565b50506100c0565b82805482825590600052602060002090810192821561008a579160200282015b82811115610089578251829060001916905591602001919060010190610068565b5b509050610097919061009b565b5090565b6100bd91905b808211156100b95760008160009055506001016100a1565b5090565b90565b61030b806100cf6000396000f30060606040526004361061006d576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680632f265cf714610072578063392e6678146100b35780637021939f146100f2578063b13c744b14610133578063cc9ab26714610172575b600080fd5b341561007d57600080fd5b610097600480803560001916906020019091905050610199565b604051808260ff1660ff16815260200191505060405180910390f35b34156100be57600080fd5b6100d86004808035600019169060200190919050506101de565b604051808215151515815260200191505060405180910390f35b34156100fd57600080fd5b61011760048080356000191690602001909190505061023e565b604051808260ff1660ff16815260200191505060405180910390f35b341561013e57600080fd5b610154600480803590602001909190505061025e565b60405180826000191660001916815260200191505060405180910390f35b341561017d57600080fd5b610197600480803560001916906020019091905050610282565b005b60006101a4826101de565b15156101af57600080fd5b600080836000191660001916815260200190815260200160002060009054906101000a900460ff169050919050565b600080600090505b60018054905081101561023357826000191660018281548110151561020757fe5b9060005260206000209001546000191614156102265760019150610238565b80806001019150506101e6565b600091505b50919050565b60006020528060005260406000206000915054906101000a900460ff1681565b60018181548110151561026d57fe5b90600052602060002090016000915090505481565b61028b816101de565b151561029657600080fd5b6001600080836000191660001916815260200190815260200160002060008282829054906101000a900460ff160192506101000a81548160ff021916908360ff160217905550505600a165627a7a72305820c8ee97bd4bec536ae36f345980d6da2649a96085992bd5a6092eaf163769be4c0029';
    var addr = '0x66a95269ea68da9b4dcc33925fe81b22cdbca263';
    var contractInstance = VotingContract.at(addr);
    contractInstance.voteForCandidate('Rama', {from: web3.eth.accounts[0]});
    // contractInstance.voteForCandidate('Rama', {from: web3.eth.accounts[0]});
    // contractInstance.voteForCandidate('Rama', {from: web3.eth.accounts[0]});

    console.log(contractInstance);
    res.end('tryyy');
}) 