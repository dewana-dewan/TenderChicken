pragma solidity ^0.4.18;

contract bid{
    uint8 id;
    string title;
    mapping(address => string) hash_map;
    string[] hashes;
    
    function submit_hash(string tot_hash) public{
        // if he is already there, don't accept hash;
        require(!hash_map[msg.sender]);
        hash_map[msg.sender] = tot_hash;
    }
    
    function validate_hash(string tot_hash) public{
        if(hash_map[msg.sender] && hash_map[msg.sender] == tot_hash)
            return true;
        else
            return false;
    }
}