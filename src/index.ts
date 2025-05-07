import { UltraHonkBackend } from '@aztec/bb.js';
import { CompiledCircuit, Noir } from '@noir-lang/noir_js';
import circuit_simple_vote from '../circuits/simple_vote/target/simple_vote.json';
import circuit_poseidon from '../circuits/hashing_poseidon/target/hashing_poseidon.json';

async function init() {
    const vote = "1"
    const voter_secret = "1234"
    const noir_poseidon = new Noir(circuit_poseidon as CompiledCircuit);
    const { returnValue } = await noir_poseidon.execute({ voter_secret, vote });
    const vote_hash = returnValue

    const noir = new Noir(circuit_simple_vote as CompiledCircuit);
    const backend = new UltraHonkBackend(circuit_simple_vote.bytecode);
    console.info("logs", "Generating witness... ⏳");
    const { witness } = await noir.execute({ voter_secret, vote, vote_hash });
    console.info("logs", "Generated witness... ✅");
    console.info("logs", "Generating proof... ⏳");
    const proof = await backend.generateProof(witness);
    console.info("logs", "Generated proof... ✅");
    console.info("results", proof.proof);
    console.info("logs", "Verifying proof... ⌛");
    const isValid = await backend.verifyProof(proof);
    console.info("logs", `Proof is ${isValid ? "valid" : "invalid"}... ✅`);
}



init()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })