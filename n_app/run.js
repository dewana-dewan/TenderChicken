const express        = require('express');
var router           = express.Router();
const MongoClient    = require('mongodb').MongoClient;
const bodyParser     = require('body-parser');
const app            = express();

Web3 = require('web3');
web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
var fs = require("fs")
solc = require('solc')

var port = process.env.PORT || 3000;

var server = app.listen(port, function() {
	console.log('Express server listening on port ' + port);
});

app.use('/api', router);

router.get('/make_contract', function(req, res) {

	console.log(req.query.name);

	code = fs.readFileSync('./contracts/Voting.sol').toString()
	compiledCode = solc.compile(code)
	abiDefinition = JSON.parse(compiledCode.contracts[':Voting'].interface)
	VotingContract = web3.eth.contract(abiDefinition)
	byteCode = compiledCode.contracts[':Voting'].bytecode
	deployedContract = VotingContract.new(['Rama','Nick','Jose'],{data: byteCode, from: web3.eth.accounts[0], gas: 4700000})

	setTimeout(function () {
		var a = deployedContract.address
		console.log(a)
		contractInstance = VotingContract.at(deployedContract.address)
    	res.json({ message: 'hooray!', address: a });   
	}, 1000)
	
});
