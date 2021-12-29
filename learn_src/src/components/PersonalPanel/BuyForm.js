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