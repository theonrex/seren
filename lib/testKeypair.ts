// testKeypair.ts
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

/**
 * Returns a test Ed25519 keypair.
 * You can use this to sign test transactions.
 */
export const getTestKeypair = (): Ed25519Keypair => {
	return Ed25519Keypair.generate();
};
