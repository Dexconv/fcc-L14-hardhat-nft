const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../hardhat-helper.config")
const { assert, expect } = require("chai")

//test token counter
//test token uri
//test token name and symbol
!developmentChains.includes(network.name)
    ? describe.skip
    : describe("BasicNFT", () => {
          let deployer, contract
          beforeEach(async () => {
              //get deployer
              deployer = (await getNamedAccounts()).deployer
              //deploy contract
              await deployments.fixture("basic")
              //get contract
              const tokenContract = await deployments.get("BasicNFT")
              contract = await ethers.getContractAt(
                  tokenContract.abi,
                  tokenContract.address
              )
          })
          describe("constructor", () => {
              it("checks initial values", async () => {
                  const count = await contract.getTokenCounter()
                  const name = await contract.name()
                  const symbol = await contract.symbol()
                  assert.equal(count.toString(), "0")
                  assert.equal(name, "Doggie")
                  assert.equal(symbol, "DOG")
              })
          })
          describe("mint nft", () => {
              beforeEach(async () => {
                  const txresponse = await contract.mintNft()
                  await txresponse.wait(1)
              })
              it("updates counter acordingly", async () => {
                  const count = await contract.getTokenCounter()
                  const tokenURI = await contract.tokenURI(0)

                  assert.equal(count.toString(), "1")
                  assert.equal(tokenURI, await contract.TOKEN_URI())
                  console.log("the deployer: ", deployer)
              })
              it("stores the correct balance and address for the owner", async () => {
                  const balance = await contract.balanceOf(deployer)
                  const ownerAddress = await contract.ownerOf("0")

                  assert.equal(balance.toString(), "1")
                  assert.equal(ownerAddress, deployer)
              })
          })
      })
