import 'dotenv/config';
import { Keypair } from '@solana/web3.js';
import { TpuConnection } from '../src/index';
import { buildSwapTx } from '../src/services/jupiter/swap';
import { performance } from 'perf_hooks';
import base58 from 'bs58';

const rpcurl = process.env.RPC_URL!;
const signer = Keypair.fromSecretKey(base58.decode(process.env.KEYPAIR!));

(async () => {
	const start = performance.now();
	const tpuConnection = await TpuConnection.load(rpcurl, {
		commitment: 'confirmed',
	});

	const v0Tx = await buildSwapTx(
		'So11111111111111111111111111111111111111112',
		'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
		20000000,
		signer.publicKey.toBase58()
	);

	v0Tx.sign([signer]);

	console.log('sending tx');
	await tpuConnection.sendAndConfirmAbortableTransaction(v0Tx, {
		skipPreflight: true,
		preflightCommitment: 'confirmed',
		maxRetries: 2,
	});
	const end = performance.now();
	const timeInMs = end - start;
	console.log(`Processed in ${timeInMs}ms`);
})();
