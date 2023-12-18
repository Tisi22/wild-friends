async function main() {
    const contractAddress = "0x31daCB8555D2D3950ce6F2908595F038B3e20Db2";
    const constructorArguments = [
      "0x0602C2494d22E1b64e698214756924d9B3A19653",
      "0x149CeE19BCF7c3d7bFB8b85180168f816a5c42bB"
    ];
  
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: constructorArguments,
    });
  }
  
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });

  //npx hardhat run scripts/verify.js --network optimism
