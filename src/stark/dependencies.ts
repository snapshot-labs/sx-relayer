import { Account, RpcProvider, ec, hash, constants, validateAndParseAddress } from 'starknet';
import * as bip32 from '@scure/bip32';
import * as bip39 from '@scure/bip39';

const basePath = "m/44'/9004'/0'/0";
const contractAXclassHash = '0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003';

export function getProvider(chainId: string) {
  const nodeUrl =
    chainId === constants.StarknetChainId.SN_MAIN
      ? process.env.STARKNET_MAINNET_RPC_URL
      : process.env.STARKNET_GOERLI_RPC_URL;

  return new RpcProvider({ nodeUrl });
}

export function getStarknetAccount(mnemonic: string, index: number) {
  const masterSeed = bip39.mnemonicToSeedSync(mnemonic);
  const hdKey1 = bip32.HDKey.fromMasterSeed(masterSeed).derive("m/44'/60'/0'/0/0");
  const hdKey2 = bip32.HDKey.fromMasterSeed(hdKey1.privateKey!);

  const path = `${basePath}/${index}`;
  const starknetHdKey = hdKey2.derive(path);

  const privateKey = ec.starkCurve.grindKey(starknetHdKey.privateKey!);
  const starkKeyPubAX = ec.starkCurve.getStarkKey(privateKey);

  const address = hash.calculateContractAddressFromHash(
    starkKeyPubAX,
    contractAXclassHash,
    [starkKeyPubAX, 0],
    0
  );

  return { address, privateKey: `0x${privateKey}` };
}

export const DEFAULT_INDEX = 1;
export const SPACES_INDICIES = {
  '0x040e337fb53973b08343ce983369c1d9e6249ba011e929347288e4d8b590d048': 2
};

export function createAccountProxy(mnemonic: string, provider: RpcProvider) {
  const accounts = new Map<string, Account>();

  return (spaceAddress: string) => {
    const normalizedSpaceAddress = validateAndParseAddress(spaceAddress);
    if (!accounts.has(normalizedSpaceAddress)) {
      const index = SPACES_INDICIES[normalizedSpaceAddress] || DEFAULT_INDEX;
      const { address, privateKey } = getStarknetAccount(mnemonic, index);

      accounts.set(normalizedSpaceAddress, new Account(provider, address, privateKey));
    }

    return accounts.get(normalizedSpaceAddress) as Account;
  };
}