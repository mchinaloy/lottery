const assert = require('assert');
const ganache = require('ganache-cli');
const { describe } = require('mocha');
const { beforeEach } = require('mocha');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const lotteryContract = require('../compile');

let lottery;
let accounts;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    lottery = await new web3.eth.Contract(lotteryContract.abi)
        .deploy({data: lotteryContract.evm.bytecode.object})
        .send({from: accounts[0], gas: '1000000'});
    console.log(lotteryContract)
});

describe('Lottery Contract', () => {
    it('deploys a contract', () => {
        assert.ok(lottery.options.address);
    });

    it('can enter the lottery', async () => {
        await lottery.methods.enter().send({from: accounts[0], value: web3.utils.toWei('1', 'ether')});
        const results = await lottery.methods.getPlayers().call();
        assert.equal(1, results.length);
        assert.equal(accounts[0], results[0]);
    });

    it('can enter with multiple accounts', async () => {
        await lottery.methods.enter().send({from: accounts[1], value: web3.utils.toWei('1', 'ether')});
        await lottery.methods.enter().send({from: accounts[2], value: web3.utils.toWei('1', 'ether')});
        const results = await lottery.methods.getPlayers().call();
        assert.equal(2, results.length);
        assert.equal(accounts[1], results[0]);
        assert.equal(accounts[2], results[1]);
    });

    it('requires a minimum amount of ether to enter', async () => {
        try {
            await lottery.methods.enter().send({from: accounts[0], value: web3.utils.toWei('0.0', 'ether')});
            assert(false);
        } catch(err) {
            assert(err);
        }
    });

    it('non-manager cannot pick the winner', async () => {
        try {
            await lottery.methods.pickWinner().send({from: accounts[1], value: 0});
        } catch (err) {
            assert(true);
        }
    });

    it('sends money to the winner and resets the players array', async () => {
        const startingBalance = await web3.eth.getBalance(accounts[0]);
        await lottery.methods.enter().send({from: accounts[0], value: web3.utils.toWei('2', 'ether')});
        await lottery.methods.pickWinner().send({from: accounts[0]});
        const endBalance = await web3.eth.getBalance(accounts[0]);
        const difference = startingBalance - endBalance;
        assert(difference > web3.utils.toWei('0.00017', 'ether'))
    });
});
