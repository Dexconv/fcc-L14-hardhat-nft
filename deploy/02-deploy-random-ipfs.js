const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../hardhat-helper.config")
const { verify } = require("../utils/verify")
const {
    storeImages,
    storeTokenUriMetadata,
} = require("../utils/uploadToPinata")
const { tokenToString } = require("typescript")
require("dotenv").config()

const imageLocation = "./images/randomNft"
const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            trait_type: "cuteness",
            value: 100,
        },
    ],
}

const FUND_AMOUNT = "1000000000000000000000"

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    let VRFCoordinatorV2Address, subsctiptionId
    let tokenUris = [
        "ipfs://QmQs4yASJakykKzcUYiJoQEFptCuufghNA3S5J2CkD47tp",
        "ipfs://QmXry9jwWVKfbt6V87Gzd97WJ5LGAmtyWY7znSQXCRysv9",
        "ipfs://QmX5V7Xc31vMfM8tYgrNefix1WCFmiMqpLzjDtk6PgTQd2",
    ]

    if (process.env.UPLOAD_TO_PINATA == "true") {
        log("______uploading to pinata______")
        tokenUris = await handleTokenUris()
    }

    if (developmentChains.includes(network.name)) {
        const CoordinatorContract = await deployments.get(
            "VRFCoordinatorV2Mock"
        )
        VRFCoordinatorV2Mock = await ethers.getContractAt(
            CoordinatorContract.abi,
            CoordinatorContract.address
        )

        VRFCoordinatorV2Address = CoordinatorContract.address

        const transactionResponse =
            await VRFCoordinatorV2Mock.createSubscription()
        const transactionReceipt = await transactionResponse.wait(1)
        //using logs[0] instead of events[0]
        subsctiptionId = transactionReceipt.logs[0].args.subId
        log("mock subscription id: ", subsctiptionId)
        await VRFCoordinatorV2Mock.fundSubscription(subsctiptionId, FUND_AMOUNT)
    } else {
        VRFCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
        subsctiptionId = networkConfig[chainId].subscriptionId
    }
    log("________________________________")
    const args = [
        VRFCoordinatorV2Address,
        subsctiptionId,
        networkConfig[chainId].gasLane,
        networkConfig[chainId].callbackGasLimit,
        tokenUris,
        networkConfig[chainId].mintFee,
    ]
    const randomNft = await deploy("RandomIpftNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        log("verifying...")
        await verify(randomNft.address, args)
        log("succesfully verifyied ")
        log("_______________________________________________")
    }
}

async function handleTokenUris() {
    tokenUris = []
    //store image to ipfs
    //store metadata in ipfs

    const { responses: imageUploadResp, files } = await storeImages(
        imageLocation
    )
    for (index in imageUploadResp) {
        let tokenUriMetadata = { ...metadataTemplate }
        tokenUriMetadata.name = files[index].replace(".png", "")
        tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name} pup!`
        tokenUriMetadata.image = `ipfs://${imageUploadResp[index].IpfsHash}`

        console.log(`uploading ${tokenUriMetadata.name}...`)
        const metadataUploadResp = await storeTokenUriMetadata(tokenUriMetadata)
        tokenUris.push(`ipfs://${metadataUploadResp.IpfsHash}`)
    }
    console.log("token uris uploaded, they are:")
    console.log(tokenUris)
    return tokenUris
}

module.exports.tags = ["all", "ipfs", "main"]
