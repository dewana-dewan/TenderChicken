web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
abi = [ { constant: true,
    inputs: [ [Object] ],
    name: 'totalVotesFor',
    outputs: [ [Object] ],
    payable: false,
    stateMutability: 'view',
    type: 'function' },
  { constant: true,
    inputs: [ [Object] ],
    name: 'validCandidate',
    outputs: [ [Object] ],
    payable: false,
    stateMutability: 'view',
    type: 'function' },
  { constant: true,
    inputs: [ [Object] ],
    name: 'votesReceived',
    outputs: [ [Object] ],
    payable: false,
    stateMutability: 'view',
    type: 'function' },
  { constant: true,
    inputs: [ [Object] ],
    name: 'candidateList',
    outputs: [ [Object] ],
    payable: false,
    stateMutability: 'view',
    type: 'function' },
  { constant: false,
    inputs: [ [Object] ],
    name: 'voteForCandidate',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function' },
  { inputs: [ [Object] ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'constructor' } ];

VotingContract = web3.eth.contract(abi);
// In your nodejs console, execute contractInstance.address to get the address at which the contract is deployed and change the line below to use your deployed address
contractInstance = VotingContract.at('0x66a95269ea68da9b4dcc33925fe81b22cdbca263');
candidates = {"Rama": "candidate-1", "Nick": "candidate-2", "Jose": "candidate-3"}

function voteForCandidate() {
  candidateName = $("#candidate").val();
  contractInstance.voteForCandidate(candidateName, {from: web3.eth.accounts[0]}, function() {
    let div_id = candidates[candidateName];
    // $("#" + div_id).html(contractInstance.totalVotesFor.call(candidateName).toString());
  });
}

$(document).ready(function() {
  candidateNames = Object.keys(candidates);
  for (var i = 0; i < candidateNames.length; i++) {
    let name = candidateNames[i];
    let val = contractInstance.totalVotesFor.call(name).toString()
    $("#" + candidates[name]).html(val);
  }
});