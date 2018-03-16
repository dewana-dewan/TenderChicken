Web3 = require('web3')
web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
<<<<<<< HEAD
=======
var fs = require("fs")
>>>>>>> 44db8e24dfac81c37b1d1e17aa1caf95f3a2d20a
code = fs.readFileSync('../contracts/Voting.sol').toString()
solc = require('solc')
compiledCode = solc.compile(code)
abiDefinition = JSON.parse(compiledCode.contracts[':Voting'].interface)
VotingContract = web3.eth.contract(abiDefinition)
byteCode = compiledCode.contracts[':Voting'].bytecode
deployedContract = VotingContract.new(['Rama','Nick','Jose'],{data: byteCode, from: web3.eth.accounts[0], gas: 4700000})
deployedContract.address
contractInstance = VotingContract.at(deployedContract.address)
