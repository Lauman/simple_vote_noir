import { UltraHonkBackend } from '@aztec/bb.js';
import { CompiledCircuit, Noir } from '@noir-lang/noir_js';
import circuit_simple_vote from '../circuits/simple_vote/target/simple_vote.json';
import circuit_poseidon from '../circuits/hashing_poseidon/target/hashing_poseidon.json';


class NoirInstance {
    circuitEspecification: CompiledCircuit;
    noir_instance: Noir;
    noir_backend: UltraHonkBackend;
    name : string;

    constructor(circuitEspecification : CompiledCircuit,name : string) {
        this.circuitEspecification = circuitEspecification;
        this.noir_instance = new Noir(circuitEspecification as CompiledCircuit)
        this.noir_backend = new UltraHonkBackend(circuit_simple_vote.bytecode)
        this.name = name
    }

}


async function init() {
    const vote = "1"
    const voter_secret = "1234"
    const noir_hashing_poseidon = new NoirInstance(circuit_poseidon as CompiledCircuit,"hashing_poseidon");
    const { returnValue } = await noir_hashing_poseidon.noir_instance.execute({ voter_secret, vote });
    const vote_hash = returnValue
    
    const noir_simple_vote = new NoirInstance(circuit_simple_vote as CompiledCircuit,"simple_vote");
    console.info("logs", "Generating witness... ⏳");
    const { witness } = await noir_simple_vote.noir_instance.execute({ voter_secret, vote, vote_hash });
    console.info("logs", "Generated witness... ✅");
    console.info("logs", "Generating proof... ⏳");
    const proof = await noir_simple_vote.noir_backend.generateProof(witness);
    console.info("logs", "Generated proof... ✅");
    console.info("results", proof.proof);
    console.info("logs", "Verifying proof... ⌛");
    const isValid = await noir_simple_vote.noir_backend.verifyProof(proof);
    console.info("logs", `Proof is ${isValid ? "valid" : "invalid"}... ✅`);
}



init()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })