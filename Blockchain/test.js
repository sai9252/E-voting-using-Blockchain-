const hre  = require('hardhat');


const get = async()=>{
    // const accounts = await hre.ethers.getSigners();
    const contract = await hre.ethers.getContractAt("Voting","0x5FbDB2315678afecb367f032d93F642f64180aa3");
    
    console.log(await contract.getAddress()); 
    
    const election = await contract.getElection(1);
    console.log(election)
}

get()