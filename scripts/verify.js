async function main() {
    const contractAddress = "0x6d6f42a8D7a993Cbf8e009380a9478FccDf68e2D";
    const constructorArguments = [
      "0x0602C2494d22E1b64e698214756924d9B3A19653",
      "0x31daCB8555D2D3950ce6F2908595F038B3e20Db2",
      [1, 2, 3, 4, 5],
      ["2000000000000000", "2000000000000000", "2000000000000000", "2000000000000000", "2000000000000000"]
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
