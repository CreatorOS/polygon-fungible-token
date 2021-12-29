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