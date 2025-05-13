import { VersionedTransaction } from '@solana/web3.js';
import axios from 'axios';

export interface JupiterSwapResponse {
	swapType: string;
	requestId: string;
	inAmount: string;
	outAmount: string;
	otherAmountThreshold: string;
	swapMode: string;
	slippageBps: number;
	priceImpactPct: string;
	routePlan: Array<{
		swapInfo: {
			ammKey: string;
			label: string;
			inputMint: string;
			outputMint: string;
			inAmount: string;
			outAmount: string;
			feeAmount: string;
			feeMint: string;
		};
		percent: number;
	}>;
	inputMint: string;
	outputMint: string;
	feeBps: number;
	taker: string;
	gasless: boolean;
	transaction: string;
	prioritizationType: string;
	prioritizationFeeLamports: number;
	dynamicSlippageReport: {
		slippageBps: number;
		otherAmount: string | null;
		simulatedIncurredSlippageBps: number | null;
		amplificationRatio: number | null;
		categoryName: string;
		heuristicMaxSlippageBps: number;
		rtseSlippageBps: number;
		failedTxnEstSlippage: number;
		emaEstSlippage: number;
		useIncurredSlippageForQuoting: boolean | null;
	};
	totalTime: number;
}

export const buildSwapTx = async (
	inputMint: string,
	outputMint: string,
	amount: number,
	taker: string
): Promise<VersionedTransaction> => {
	const orderResponse = await axios
		.get<JupiterSwapResponse>('https://lite-api.jup.ag/ultra/v1/order', {
			params: {
				inputMint,
				outputMint,
				amount,
				taker,
			},
		})
		.then((res) => res.data);

	const transactionBase64 = orderResponse.transaction;

	const transaction = VersionedTransaction.deserialize(
		Buffer.from(transactionBase64, 'base64')
	);

	return transaction;
};
