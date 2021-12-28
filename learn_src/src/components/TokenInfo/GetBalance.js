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