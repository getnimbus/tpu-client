import 'dotenv/config';
import {
	Transaction,
	Keypair,
	SystemProgram,
	ComputeBudgetProgram,
	TransactionMessage,
	VersionedTransaction,
} from '@solana/web3.js';
import { TpuConnection } from '../src/index';
import { performance } from 'perf_hooks';
import base58 from 'bs58';

const rpcurl = process.env.RPC_URL!;
const signer = Keypair.fromSecretKey(base58.decode(process.env.KEYPAIR!));

(async () => {
	const start = performance.now();
	const tpuConnection = await TpuConnection.load(rpcurl, {
		commitment: 'confirmed',
	});

	const tx = new Transaction();
	const instruction = SystemProgram.transfer({
		fromPubkey: signer.publicKey,
		toPubkey: signer.publicKey,
		lamports: 1,
	});
	tx.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1000 }));
	tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 10_000 }));
	tx.add(instruction);

	const messageV0 = new TransactionMessage({
		payerKey: signer.publicKey,
		recentBlockhash: (await tpuConnection.getLatestBlockhash()).blockhash,
		instructions: tx.instructions,
	}).compileToV0Message();

	const v0Tx = new VersionedTransaction(messageV0);

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
