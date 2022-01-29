# Connecting to Polygon with ethers.js and react.js

Hello folks! In this quest, we will learn how to build an interface that does stuff on Polygon. We will deploy a fungible token contract on Mumbai and play around with it using a react page. We assume that you have a basic knowledge of react and Remix IDE.
Will not keep you longer, shall we start?

## First step - the contract
The interface should connect to a contract, right? 
- Go to https://remix.ethereum.org/
- Make sure you are on Mumbai if you open your wallet
- Get some Mumbai funds if you are running short: https://faucet.polygon.technology/ 
- Copy and paste the contract below, compile, and deploy. 
```js
//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Token{
    uint256 public totalSupply_;
    string public name;
    string public symbol;
    uint8 public decimals;
    address public owner;
    mapping(address => uint256) balances;
    mapping(address => mapping(address => uint256)) allowed;

    event Approval(
        address indexed tokenOwner,
        address indexed spender,
        uint256 tokens
    );

    event Transfer(address indexed from, address indexed to, uint256 tokens);

    constructor(
        uint256 _total,
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        address _owneraddress
    ) {
        totalSupply_ = _total;
        owner = _owneraddress;
        balances[_owneraddress] = totalSupply_;
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
    }

    function totalSupply() public view returns (uint256) {
        return totalSupply_;
    }

    function balanceOf(address tokenOwner) public view returns (uint256) {
        return balances[tokenOwner];
    }

    function transfer(address receiver, uint256 numTokens)
        public
        returns (bool)
    {
        require(numTokens <= balances[msg.sender]);
        balances[msg.sender] = balances[msg.sender] - numTokens;
        balances[receiver] = balances[receiver] + numTokens;
        emit Transfer(msg.sender, receiver, numTokens);
        return true;
    }

    function approve(address delegate, uint256 numTokens)
        public
        returns (bool)
    {
        allowed[msg.sender][delegate] = numTokens;
        emit Approval(msg.sender, delegate, numTokens);
        return true;
    }

    function allowance(address _owner, address _delegate)
        public
        view
        returns (uint256)
    {
        return allowed[_owner][_delegate];
    }

    function transferFrom(
        address _owner,
        address _buyer,
        uint256 numTokens
    ) public returns (bool) {
        require(numTokens <= balances[_owner]);
        require(numTokens <= allowed[_owner][msg.sender]);
        balances[_owner] = balances[_owner] - numTokens;
        allowed[_owner][msg.sender] = allowed[_owner][msg.sender] - numTokens;
        balances[_buyer] = balances[_buyer] + numTokens;
        emit Transfer(_owner, _buyer, numTokens);
        return true;
    }

    function buy(uint256 numOfTokens) public payable returns (bool) {
        require(numOfTokens <= balances[owner]);
        require(owner != msg.sender);
        require(msg.value == (numOfTokens / 10**decimals) * 0.000000001 ether);
        balances[msg.sender] = balances[msg.sender] + numOfTokens;
        balances[owner] = balances[owner] - numOfTokens;
        emit Transfer(owner, msg.sender, numOfTokens);
        return true;
    }
}
```
This is an ERC20 contract, you can see it has all the required functions. There is also a function ``` buy ``` that allows users to buy your token. Go through the code, it simply implements the specifications needed for a fungible token. To be able to interact with a contract on Polygon, we need two things. Guessed it? We need the contract address and ABI. Fortunately, Remix gives you these, make sure to save these somewhere as we are going to use them later on. 

## Setting up the project
- Create a react app:
-   ```npx create-react-app your-app-name```
- cd into your-app-name
- Run this in your terminal: ``` npm install ethers ```. 
- Run ``` npm start ```, a new tab should open in your browser.
We will use ethers.js to interact with Polygon (call our contract's functions). There are a couple of things to do before we jump into the actual coding:
- In your project's root, create a directory called _components_.
- cd into _components_, create two directories: _TokenInfo_ and _PersonalPanel_.
- In _TokenInfo_, create two files: _GetBalance.js_ and _Header.js_.
- In _PersonalPanel_, create two files, _BuyForm.js_ and _TransferForm.js_.
- Lastly, change your App.js to look like this:

```js
import './App.css';
import Header from './components/TokenInfo/Header';
import GetBalance from './components/TokenInfo/GetBalance';
import BuyForm from './components/PersonalPanel/BuyForm';
import TransferForm from './components/PersonalPanel/TransferForm';
function App() {
  return (
    <div className="App">
      <Header/>
     <GetBalance/>
     <div>Wanna transfer?</div>
     <TransferForm/>
     <div>Wanna buy?</div>
     <BuyForm/>
    </div>
  );
}

export default App;

``` 
You see, we imported all the components to App.js, so they get rendered to the browser. Now, Remember the Address and ABI thing? We need to import them to each component so we can talk to the contract. In your project root, create a _config.js_, populate it with your token's info like this:
```js
export const ADDRESS = ""//Paste address here
export const DECIMALS = //The number of decimals you chose when deploying the contract
export const ABI = //You can get this from Remix, in the Solidity Compiler tab.
```
Note that we will hardcode the DECIMALS field instead of calling the _decimals_ function of the contract. This is just to simplify the job.

## First component - Header.js
Open Header.js, here we will write stuff that will appear first on our page. Let's brainstorm together, what would you like to know about a token? Its name, for sure. What else? Address? sure. Its owner, and yeah, how many tokens are sold or in circulation. How about we include all of these?
To start, write these lines:
```js
import { ethers } from "ethers"
import React from "react"
import { ADDRESS, ABI, DECIMALS } from "../../config"
class Header extends React.Component {
    constructor() {
        super()
        this.state = {
            tokensSold: "0",
            name: "",
            owner: "",
            totalSupply: ""
        }
    }

    async componentDidMount() {
        
    }

    render() {
        return (
            <div>
                <div> This is the {this.state.name} fungible token on Polygon, Mumbai testnet. </div>
                <hr />
                <div> Token address is: {ADDRESS} </div>
                <hr />
                <div> Owner address is {this.state.owner} </div>
                <hr />
                <div> Tokens already sold: {this.state.tokensSold} / {this.state.totalSupply}</div>
                <hr />
            </div>
        )
    }
}
export default Header
```
Nothing Blockchain-related so far. Notice that we are saving the info to display in Header's state. To populate this state, we need to query our contract. It is a good idea to do this querying at the last step of the mounting phase (when a component is mounted to the DOM). This is some react stuff, feel free to dig deep if you like. But in short, ``` componentDidMount ``` is where it is most suitable to call ``` this.setState ```. So, put these inside ``` componentDidMount ```:
```js
        let provider = new ethers.providers.Web3Provider(window.ethereum)
        const contract = new ethers.Contract(
            ADDRESS,
            ABI,
            provider
        )
        let supply = await contract.totalSupply()
        let tokenName = await contract.name()
        let ownerAddress = await contract.owner()
        let ownerBalance = await contract.balanceOf(ownerAddress)
        supply = parseInt(supply)
        ownerBalance = parseInt(ownerBalance)
        let sold = (supply - ownerBalance) / (10 ** DECIMALS)
        this.setState({
            tokensSold: sold,
            name: tokenName,
            owner: ownerAddress,
            totalSupply: supply / (10 ** DECIMALS)
        })
```
Pretty obvious, huh? First, we get the provider (MetaMask in our case). Then, we get the contract abstraction. Aaand finally, we read stuff from the contract and store them in ```this.state```. Now if you save and go to your browser, you should see the info there! 

## Second component - GetBalance.js:
Go to _GetBalance.js_, we will do more or less the same. But with an extra tweak. We would like to know how many tokens a specific address holds. So we need to take input (the holder's address) and call the ``` balanceOf() ``` Solidity function with that input.  
Write these:
```js
import React from "react";
import { ethers } from "ethers";
import { ADDRESS, ABI, DECIMALS } from "../../config";

class GetBalance extends React.Component {
    constructor() {
        super()
        this.state = {
            address: "",
            balance: "0"
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        const { name, value } = event.target
        this.setState({
            [name]: value
        })
    }

    async handleSubmit(event) {
        event.preventDefault();
       
    }

    render() {
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <input type="text"
                        placeholder="address"
                        name="address"
                        value={this.state.address}
                        onChange={this.handleChange}
                    />
                    <button type="submit">Get Balance</button>
                </form>
                <div>This address has {this.state.balance} tokens</div>
                <hr />
            </div>
        )
    }
}
export default GetBalance;
```
What this does is just take input and save it in the state. We want to call ``` balanceOf ``` with state.address as a parameter and show the result in the browser. ``` handleSubmit ``` is a good choice for this, so that ``` balanceOf ``` is called on submission. Now let's write some ethers.js lines. this is how ``` handleSubmit ``` should look like:
```js
async handleSubmit(event) {
        event.preventDefault();
        let provider = new ethers.providers.Web3Provider(window.ethereum)
        const contract = new ethers.Contract(
            ADDRESS,
            ABI,
            provider
        )
        let queriedBalance = await contract.balanceOf(this.state.address)
        queriedBalance = parseInt(queriedBalance) / (10 ** DECIMALS)
        this.setState({
            balance: queriedBalance
        })
    }
```
Now save and test this in your browser. Copy your address (with which you deployed the contract) to the form and submit it, do you see it?

## Third component - TransferForm
All the functions we called (Solidity) are read-only. We did not try to change the blockchain state yet. But now we will do that now with the ``` transfer ``` function. We will create a form that allows transferring a custom number of tokens.
Aaand again, copy this boilerplate code:
```js
import React from "react";
import { ethers } from "ethers";
import { ABI, ADDRESS, DECIMALS } from "../../config";

class TransferForm extends React.Component {
    constructor() {
        super()
        this.state = {
            receiver: "",
            numOfTokens: "0"
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleChange(event) {
        const { name, value } = event.target
        this.setState({
            [name]: value
        })
    }

    async handleSubmit(event) {
        event.preventDefault()
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <input
                    type="text"
                    placeholder="Receiver"
                    name="receiver"
                    value={this.state.receiver}
                    onChange={this.handleChange}
                />
                <input
                    type="number"
                    placeholder="Transfer!"
                    name="numOfTokens"
                    value={this.state.numOfTokens}
                    onChange={this.handleChange}
                />
                <br />
                <button type="submit"> Transfer </button>
                <hr />
            </form>
        )
    }
}
export default TransferForm
```
Aaaand again, let's handle the logic in ``` handleSubmit ```, change it to the following:
```js
 async handleSubmit(event) {
        event.preventDefault()
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(
            ADDRESS,
            ABI,
            signer
        )
        let numberOfTokensToSend = this.state.numOfTokens * (10 ** DECIMALS)
        await contract.transfer(this.state.receiver, numberOfTokensToSend)
    }
```
Did you notice something different here? We are using the keyword _signer_ here, not _provider_ as we previously did. This is because we are not reading from, we are writing to. So the message should be signed with the user's private key. This is why MetaMask will pop up if you now save and try to transfer tokens. go ahead and try it, maybe send it to another account that is owned by you. You can create one easily with MetaMask. It is recommended to do this anyway for easier testing.

## Fourth component - BuyForm
You may have noticed that we are introducing something new with every component. First, read from read-only functions with user input. Second, the same but with user input. Third, calling state-changing functions. Fourth, let's call a state-changing payable function. We have such a function in our contract, i.e. ``` buy ```.
Last time, I promise, copy this:
```js
import React from "react";
import { ethers } from "ethers";
import { ABI, ADDRESS, DECIMALS } from "../../config";

class BuyForm extends React.Component {
    constructor() {
        super()
        this.state = {
            numOfTokens: "0"
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleChange(event) {
        const { name, value } = event.target
        this.setState({
            [name]: value
        })
    }

    async handleSubmit(event) {
        event.preventDefault()
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <input
                    type="number"
                    placeholder="Buy!"
                    name="numOfTokens"
                    value={this.state.numOfTokens}
                    onChange={this.handleChange}
                />
                <button type="submit"> Buy </button>
                <hr />
            </form>
        )
    }
}
export default BuyForm
```
In the contract, we require that a user sends 1 Gwei to call ``` buy ```. How to do this in code? Check this:
```js
 async handleSubmit(event) {
        event.preventDefault()
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(
            ADDRESS,
            ABI,
            signer
        )
        let numberOfTokensToBuy = this.state.numOfTokens * (10 ** DECIMALS)
        const overrides = {
            value: ethers.utils.parseEther("0.000000001")
        }
        await contract.buy(numberOfTokensToBuy, overrides)
    }
```
Change your ```handleSubmit ``` to this. Did you see it? that ``` override ``` thing? This is how to send a value along with the function call.

And yes, it is the end. Stay tuned and happy coding!
