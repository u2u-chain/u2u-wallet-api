import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { TREASURE_ACCOUNT_ID, TREASURE_ACCOUNT_PRIVATE_KEY, HEDERA_NODE_ADDRESS, HEDERA_NODE_ACCOUNT_ID } from "../common/configs/env";
import { AccountId } from "@hashgraph/sdk";

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

  async getClient() {
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

  async createAccount(initBars = 0) {
    const client = await this.getClient();

    const newAccountPrivateKey = PrivateKey.generateED25519();
    const newAccountPublicKey = newAccountPrivateKey.publicKey;

    const newAccount = await new AccountCreateTransaction()
      .setKey(newAccountPublicKey)
      .setInitialBalance(Hbar.fromTinybars(initBars))
      .execute(client);

    const getReceipt = await newAccount.getReceipt(client);

    return {
      accountId: getReceipt.accountId,
      privateKey: newAccountPrivateKey,
      publicKey: newAccountPublicKey,
    };
  }
}
