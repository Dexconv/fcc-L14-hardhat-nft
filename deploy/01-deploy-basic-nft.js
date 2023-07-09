const { network } = require("hardhat")
const { developmentChains } = require("../hardhat-helper.config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    log("_______________________________________")
    const args = []
    const basicNft = await deploy("BasicNFT", {
        args: args,
        from: deployer,
        log: true,
        withConfirmations: network.config.blockConfirmations || 1,
    })
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(basicNft.address, args)
    }
    log("_______________________________________")
}
module.exports.tags = ["all", "basic"]
