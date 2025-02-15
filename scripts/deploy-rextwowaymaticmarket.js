async function main() {

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Requires REXReferral is deployed

  const [deployer] = await ethers.getSigners();
  console.log(process.argv);

  // Polygon Mainnet
  const HOST_ADDRESS = "0x3E14dC1b13c488a8d5D310918780c983bD5982E7";
  const CFA_ADDRESS = "0x6EeE6060f715257b970700bc2656De21dEdF074C";
  const IDA_ADDRESS = "0xB0aABBA4B2783A72C52956CDEF62d438ecA2d7a1";
  const TELLOR_ORACLE_ADDRESS = "0xACC2d27400029904919ea54fFc0b18Bf07C57875";

  DAIX_ADDRESS = "0x1305F6B6Df9Dc47159D12Eb7aC2804d4A33173c2";
  USDCX_ADDRESS = "0xCAa7349CEA390F89641fe306D93591f87595dc1F";
  TELLOR_USDC_REQUEST_ID = 78;
  MATICX_ADDRESS = "0x3aD736904E9e65189c3000c7DD2c8AC8bB7cD4e3";
  TELLOR_MATIC_REQUEST_ID = 6;


  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const REXTwoWayMaticMarket = await ethers.getContractFactory("REXTwoWayMaticMarket");
  // const rexTwoWayMarket = await REXTwoWayMarket.attach("0x3047B6AF355D9D35f0c976f1c0F90EeE13a9a6FD");

  console.log("Deploying REXTwoWayMaticMarket")
  const rexTwoWayMarket = await REXTwoWayMaticMarket.deploy(deployer.address,
                                                      HOST_ADDRESS,
                                                      CFA_ADDRESS,
                                                      IDA_ADDRESS,
                                                      process.env.SF_REG_KEY,
                                                      process.env.REX_REFERRAL_ADDRESS
                                                     );


   await rexTwoWayMarket.deployed();
   console.log("Deployed REXTwoWayMaticMarket at address:", rexTwoWayMarket.address);

  await rexTwoWayMarket.initializeTwoWayMarket(
    USDCX_ADDRESS,
    TELLOR_USDC_REQUEST_ID,
    1e9,
    MATICX_ADDRESS,
    TELLOR_MATIC_REQUEST_ID,
    1e9,
    20000,
    20000,
    {gasLimit: 2000000}
  );
  console.log("Initialized twoway market.")

  await sleep(5000);

  await rexTwoWayMarket.initializeSubsidies(0); // 1e15/second
  console.log("Initialized subsidy.")

  console.log("Registering with RexReferral system...")
  const REXReferral = await ethers.getContractFactory("REXReferral");
  const referral = await REXReferral.attach(process.env.REX_REFERRAL_ADDRESS);
  await referral.registerApp(rexTwoWayMarket.address);
  console.log("Registered:", rexTwoWayMarket.address);
  //
  // // Affiliates will need to be setup manually
  // // referral = await referral.connect(carl);
  // // await referral.applyForAffiliate("carl", "carl");
  // // referral = await referral.connect(owner);
  // // await referral.verifyAffiliate("carl");
  //
  await rexTwoWayMarket.transferOwnership("0x9C6B5FdC145912dfe6eE13A667aF3C5Eb07CbB89"); // 1e15/second


}

main()
.then(() => process.exit(0))
.catch(error => {
    console.error(error);
    process.exit(1);
});
