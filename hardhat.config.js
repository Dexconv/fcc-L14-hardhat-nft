require("hardhat-deploy")
require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()
require("@nomicfoundation/hardhat-chai-matchers")

const PRIVATE_KEY = process.env.PRIVATE_KEY
const GEORLI_RPC_URL = process.env.GEORLI_RPC_URL || ""
const SEPOLIA_RPC_URL = process.env.GEORLI_RPC_URL || ""
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.8",
    networks: {
        localhost: {
            chainId: 31337,
        },
        hardhat: {
            chainId: 31337,
            blockConfirmations: 1,
        },
        georli: {
            url: GEORLI_RPC_URL,
            chainId: 5,
            accounts: [PRIVATE_KEY],
            blockConfirmations: 6,
        },
        sepolia: {
            url: SEPOLIA_RPC_URL,
            chainId: 11155111,
            accounts: [PRIVATE_KEY],
            blockConfirmations: 6,
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
    gasReporter: {
        enabled: false,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: process.env.COINMARKETCAP_API_KEY,
        //token: "ETH",
    },
    mocha: {
        timeout: 300000, //300 seconds max
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
        customChains: [],
    },
}
