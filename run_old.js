Web3 = require('web3')
web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
var fs = require("fs")
code = fs.readFileSync('./contracts/Voting.sol').toString()
solc = require('solc')
compiledCode = solc.compile(code)
abiDefinition = JSON.parse(compiledCode.contracts[':Voting'].interface)
bidContract = web3.eth.contract(abiDefinition)
console.log(abiDefinition)
byteCode = compiledCode.contracts[':Voting'].bytecode
deployedContract = bidContract.new({data: byteCode, from: web3.eth.accounts[0], gas: 4700000})

setTimeout(function () {
	var a = deployedContract.address
	console.log(a)
	contractInstance = bidContract.at(deployedContract.address)
	// contractInstance.submit_hash('abc', 'abc', {from: web3.eth.accounts[0]}, function() {

 //        console.log('hash submmitted');

 //     });
}, 1000)


