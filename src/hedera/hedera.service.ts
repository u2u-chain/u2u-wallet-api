import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { TREASURE_ACCOUNT_ID, TREASURE_ACCOUNT_PRIVATE_KEY } from "../common/configs/env";

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

  async createAccount(initBars = 0) {
    const myAccountId = TREASURE_ACCOUNT_ID;
    const myPrivateKey = TREASURE_ACCOUNT_PRIVATE_KEY;

    if (myAccountId == null || myPrivateKey == null) {
      throw new HttpException("Server has not been properly configured", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const client = Client.forTestnet();

    client.setOperator(myAccountId, myPrivateKey);

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
