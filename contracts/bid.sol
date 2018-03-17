pragma solidity ^0.4.18;

contract bid {
    mapping(bytes32 => bytes32) public hash_map;
    address[] public clientAddress;

    uint8 count;

    function bid () public {
        count = 0;
    }
    
    function submit_hash (bytes32 tot_hash) public{
        // if he is already there, don't accept hash;
        require (validateClient(tot_hash));
        hash_map[msg.sender] = tot_hash;
        clientAddress.push(msg.sender);
        count += 1;
    }
    
    function validate_hash (bytes32 tot_hash) public returns (bool){
        require(validateClient(tot_hash));
        if(hash_map[msg.sender] == tot_hash)
            return true;
        else
            return false;
    }

    function validateClient (bytes32 client) view public returns (bool) {
        for(uint i = 0; i < count; i++) {
          if (hash_map[clientAddress[i]] == client) {
            return true;
          }
        }
        return false;
    }
}