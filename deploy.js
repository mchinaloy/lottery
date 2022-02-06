const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
 
const { abi, evm } = require('./compile');
 
provider = new HDWalletProvider(
  'xxx',
  'https://rinkeby.infura.io/v3/ce8610453aef48cfb61aabf2b3fabff3'
);
 
const web3 = new Web3(provider);
 
/*
Address:;
0x53e2332C0B5BD84d6F1D1899EF20EB181F13b713
*/
const deploy = async () => {
  const accounts = await web3.eth.getAccounts();
 
  console.log('Attempting to deploy from account', accounts[0]);
 
  const result = await new web3.eth.Contract(abi)
    .deploy({ data: evm.bytecode.object })
    .send({ gas: '1000000', from: accounts[0] });
 
  console.log(abi);
  console.log('Contract deployed to', result.options.address);
  provider.engine.stop();
};
 
deploy();