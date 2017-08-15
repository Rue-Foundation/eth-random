var Random = artifacts.require("./Random.sol");

async function sleep(time) {
  await new Promise(function(resolve, reject) {
    setTimeout(resolve, time);
  });
}

contract('Random', async function(accounts) {
  const numberOfChecks = 100;

  it("should output between the lower and upper bound", async function() {
    const max = 100000;
    console.log("    Verifying though brute force: may take a while...");
    console.log("    Running: " + numberOfChecks + " checks");

    const generator = await Random.deployed();

    const results = [];

    generator.testRandom().watch(function(error, result) {
      assert(!error, "Error occured generating random.")
      const rand = result.args["random"].toNumber()
      results.push(rand)
      assert(rand >= 0, "Random number was under minimum.");
      assert(rand <= max, "Random number was over maximum.");
    });

    for (let i = 1; i < numberOfChecks; i++) {
      let tx = await generator.random(0, max, 1);
    }

    // after the loop is done wait a bit for events to finish recording
    await sleep(500);

    let sum = 0;
    results.forEach(x => sum += x);
    const avg = sum / results.length;

    console.log('random avg:', sum / results.length, 'out of', max, 'upper bound');
    // make sure the average is within a certain margin
    assert(avg > max * 0.4, 'avg of sample results must be within 10% of half');
    assert(avg < max * 0.6, 'avg of sample results must be within 10% of half');

    // https://github.com/ethereum/wiki/wiki/JavaScript-API#example-53
    generator.testRandom().stopWatching();

    return;
  });
});