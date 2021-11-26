// SPDX-License-Identifier: BSD
pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract PokeDex {

    uint totalPokemon;
    uint totalOwners;

    uint256 private seed;

    struct Pokemon {
        string pokemonName;
        uint level;
        uint256 timestamp;
        address owner;
    }

    struct Owner {
        address ownerAddress;
        string ownerName;
        string[] pokemonNames;
        mapping (string => Pokemon) ownedPokemon;
    }

    mapping(address => uint256) public lastLeveledUp;

    event NewPokemon(string name, uint level, uint256 timestamp, address indexed from);
    event LeveledUp(address indexed from, string name, uint level);
    address[] ownerList;

    mapping (address => Owner) public owners;

    constructor() payable {
        console.log("Pokedex initialized.");
        totalPokemon = 0;
        totalOwners = 0;
        seed = (block.timestamp + block.difficulty) % 100;
    }


    function makeOwner(string memory _name) public returns (uint ownerNumber) {
        ownerNumber = totalOwners++;
        Owner storage o = owners[msg.sender];
        o.ownerName = _name;
        o.ownerAddress = msg.sender;
        ownerList.push(msg.sender);
        console.log("Added a new owner!");

    }

    function addPokemon(string memory _name) public {


        Owner storage o = owners[msg.sender];
        o.pokemonNames.push(_name);
        o.ownedPokemon[_name] = Pokemon(_name, 0, block.timestamp, msg.sender);
        totalPokemon++;
        console.log("New Pokemon added!");

        emit NewPokemon(_name, 0, block.timestamp, msg.sender);
    }

    function levelUp(string memory _name) public {
        require (
            lastLeveledUp[msg.sender] + 15 minutes < block.timestamp,
            "Wait 15m"
        );
        lastLeveledUp[msg.sender] = block.timestamp;
        Owner storage o = owners[msg.sender];
        o.ownedPokemon[_name].level++;
        console.log("%s leveled up %s!", msg.sender, _name);
        seed = (block.difficulty + block.timestamp + seed) % 100;
        if (seed <= 50) {
            console.log("%s won!", msg.sender);
            uint256 prizeAmount = 0.0001 ether;
            require (
                prizeAmount <= address(this).balance,
                "Trying to withdraw more money than the contract has."
            );
            (bool success, ) = (msg.sender).call{value: prizeAmount}("");
            require(success, "Failed to withdraw money from contract!");
        }
        emit LeveledUp(msg.sender, _name, o.ownedPokemon[_name].level);
    }

    function getPokemonFromOwnerGivenName(string memory _name) public view returns (string memory, uint, uint256) {
        Owner storage o = owners[msg.sender];
        Pokemon storage p = o.ownedPokemon[_name];
        console.log("Got Pokemon %s @ level %d - Created %d" , p.pokemonName, p.level, p.timestamp);
        return (p.pokemonName, p.level, p.timestamp);
    }

    function getPokemonNamesGivenAddress(address _address) public view returns (string[] memory){
        Owner storage o = owners[_address];
        return o.pokemonNames;
    }

    function getAllOwners() public view returns (address[] memory) {
        return ownerList;
    }

    function getTotalOwners() public view returns (uint) {
        return totalOwners;
    }

    function getTotalPokemon() public view returns (uint) {
        return totalPokemon;
    }

}