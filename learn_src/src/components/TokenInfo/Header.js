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