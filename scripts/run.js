const main = async () => {
    const pokedexContractFactory = await hre.ethers.getContractFactory('PokeDex');
    const pokedexContract = await pokedexContractFactory.deploy({
        value: hre.ethers.utils.parseEther('0.05'),
    });
    await pokedexContract.deployed();
    console.log("Contract address -->", pokedexContract.address);

    let contractBalance = await hre.ethers.provider.getBalance(
        pokedexContract.address
    );
    console.log(
        'Contract balance:',
        hre.ethers.utils.formatEther(contractBalance)
    );

    let ownerCount;
    ownerCount = await pokedexContract.getTotalOwners();
    let pokemonCount;
    pokemonCount = await pokedexContract.getTotalPokemon();
    // Generate an owner
    let newOwnerAshTxn = await pokedexContract.makeOwner("Ash");
    await newOwnerAshTxn.wait();
    // generate another owner
    const [_, randomPerson] = await hre.ethers.getSigners();
    let newOwnerMistyTxn = await pokedexContract.connect(randomPerson).makeOwner("Misty");
    await newOwnerMistyTxn.wait();

    // should have 2 owners now
    ownerCount = await pokedexContract.getTotalOwners();
    console.log("owner #:", ownerCount.toNumber());

    // should have some contract balance removed
    contractBalance = await hre.ethers.provider.getBalance(pokedexContract.address);
    console.log(
        'Contract balance:',
        hre.ethers.utils.formatEther(contractBalance)
    );

    // add pokemon
    let newAshPokemonPikachu = await pokedexContract.addPokemon("Pikachu");
    await newAshPokemonPikachu.wait();
    let newAshPokemonMewtwo = await pokedexContract.addPokemon("Mewtwo");
    await newAshPokemonMewtwo.wait();
    let newMistyPokemonSquirtle = await pokedexContract.connect(randomPerson).addPokemon("Squirtle");
    await newMistyPokemonSquirtle.wait();

    // should have 3 pokemon now
    pokemonCount = await pokedexContract.getTotalPokemon();
    console.log("pokemon #:", pokemonCount.toNumber());

    // try leveling up Pikachu
    let ashLevelUpPikachu = await pokedexContract.levelUp("Pikachu");
    await ashLevelUpPikachu.wait();
    // try leveling up Squirtle
    let mistyLevelUpSquirtle = await pokedexContract.connect(randomPerson).levelUp("Squirtle");
    await mistyLevelUpSquirtle.wait();
    // try leveling up Squirtle again
    let mistyLevelUpSquirtle2 = await pokedexContract.connect(randomPerson).levelUp("Squirtle");
    await mistyLevelUpSquirtle2.wait();

    // check Pikachu's level
    let ashPikachuLevel = await pokedexContract.getPokemonFromOwnerGivenName("Pikachu");
    console.log("pikachu's level:", ashPikachuLevel);
    // check squirtle's level
    let mistySquirtleLevel = await pokedexContract.connect(randomPerson).getPokemonFromOwnerGivenName("Squirtle");
    console.log("squirtle's level:", mistySquirtleLevel);
};

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

runMain();