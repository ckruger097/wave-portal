const main = async () => {
    const [deployer] = await hre.ethers.getSigners();
    const accountBalance = await deployer.getBalance();

    console.log('Deploying contracts with account: ', deployer.address);
    console.log('Our account balance is: ', accountBalance.toString());
    const pokedexContractFactory = await hre.ethers.getContractFactory('PokeDex');
    const pokedexContract = await pokedexContractFactory.deploy({
        value: hre.ethers.utils.parseEther('0.001'),
    });

    await pokedexContract.deployed();

    console.log('PokeDex address is: ', pokedexContract.address);
};

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

runMain();