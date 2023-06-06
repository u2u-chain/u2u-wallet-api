import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { TREASURE_ACCOUNT_ID, TREASURE_ACCOUNT_PRIVATE_KEY, HEDERA_NODE_ADDRESS, HEDERA_NODE_ACCOUNT_ID } from "../common/configs/env";
import { AccountId, PublicKey } from "@hashgraph/sdk";

const {
  Client,
  PrivateKey,
  AccountCreateTransaction,
  AccountBalanceQuery,
  Hbar,
} = require("@hashgraph/sdk");

@Injectable()
export class HederaService {
  constructor(
  ) {
  }

  getClient() {
    const myAccountId = TREASURE_ACCOUNT_ID;
    const myPrivateKey = TREASURE_ACCOUNT_PRIVATE_KEY;

    if (myAccountId == null || myPrivateKey == null) {
      throw new HttpException("Server has not been properly configured", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    let client;
    if (HEDERA_NODE_ADDRESS) {
      const node = {[HEDERA_NODE_ADDRESS]: new AccountId(parseInt(HEDERA_NODE_ACCOUNT_ID))};
      client = Client.forNetwork(node);
    } else {
      console.log('Note: Testnet is being used.')
      client = Client.forTestnet();
    }

    client.setOperator(myAccountId, myPrivateKey);
    return client;
  }

  async createAccount(initBars = 0, importedPublicKey?: string) {
    const client = await this.getClient();
    let privateKey, publicKey;
    if (!importedPublicKey) {
      privateKey = PrivateKey.generateED25519();
      publicKey = privateKey.publicKey;
    } else {
      publicKey = PublicKey.fromString(importedPublicKey);
    }

    const newAccount = await new AccountCreateTransaction()
      .setKey(publicKey)
      .setInitialBalance(Hbar.fromTinybars(initBars))
      .execute(client);

    const getReceipt = await newAccount.getReceipt(client);

    return {
      accountId: getReceipt.accountId,
      privateKey: privateKey,
      publicKey: publicKey,
    };
  }
}
