Web3 = require('web3')
web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
var fs = require("fs")
code = fs.readFileSync('./contracts/bid.sol').toString()
solc = require('solc')
compiledCode = solc.compile(code)
abiDefinition = JSON.parse(compiledCode.contracts[':bid'].interface)
bidContract = web3.eth.contract(abiDefinition)
byteCode = compiledCode.contracts[':bid'].bytecode
deployedContract = bidContract.new({data: byteCode, from: web3.eth.accounts[0], gas: 4700000})

setTimeout(function () {
var a = deployedContract.address
console.log(a)
contractInstance = bidContract.at(deployedContract.address)
}, 1000)
