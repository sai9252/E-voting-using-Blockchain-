import artifacts from 'truffle-artifacts';
const Election = artifacts.require("Election");

export default function (deployer) {
    deployer.deploy(Election);
};