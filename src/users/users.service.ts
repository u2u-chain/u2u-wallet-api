import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "./user.model";
import { PaginateModel } from "mongoose";
import { CreateUserInput } from "./users.dto";
import { compareSync, genSalt, hashSync } from "bcrypt";
import { PASSWORD_SALT_SIZE, TREASURE_ACCOUNT_ID, TREASURE_ACCOUNT_PRIVATE_KEY } from "../common/configs/env";
const {
  Client,
  PrivateKey,
  AccountCreateTransaction,
  AccountBalanceQuery,
  Hbar,
} = require("@hashgraph/sdk");

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: PaginateModel<UserDocument>
  ) {
  }
  async createUser(input: CreateUserInput) {
    const check = await this.userModel.exists({
      email: input.email
    });
    if (check) {
      throw new HttpException("Email already been used", HttpStatus.BAD_REQUEST);
    }
    try {
      const salt = await genSalt(parseInt(PASSWORD_SALT_SIZE));
      const newUser = (await this.userModel.create({
        ...input,
        password: hashSync(input.password, salt),
        emailVerified: false,
      })).toObject();
      delete newUser.password;
      return newUser;
    } catch (e) {
      console.log(e);
      throw new HttpException("Cannot create account with this information", HttpStatus.BAD_REQUEST)
    }
  }

  async createHederaAccount() {
    const treasureAccountId = TREASURE_ACCOUNT_ID;
    const treasureAccountPrivateKey = TREASURE_ACCOUNT_PRIVATE_KEY;
    if (treasureAccountId && treasureAccountPrivateKey) {
      throw new HttpException("System has not been properly configured", HttpStatus.NOT_IMPLEMENTED);
    }

    const client = Client.forTestnet();

    client.setOperator(treasureAccountId, treasureAccountPrivateKey);

    const newAccountPrivateKey = PrivateKey.generateED25519();
    const newAccountPublicKey = newAccountPrivateKey.publicKey;

    const newAccount = await new AccountCreateTransaction()
      .setKey(newAccountPublicKey)
      .setInitialBalance(Hbar.fromTinybars(0))
      .execute(client);

    const getReceipt = await newAccount.getReceipt(client);
    const newAccountId = getReceipt.accountId;
    const accountBalance = await new AccountBalanceQuery()
      .setAccountId(newAccountId)
      .execute(client);

    return newAccountId;
  }

  getUserById(id: string) {
    return this.userModel.findOne({
      id,
    });
  }

  findUserByEmail(email: string) {
    return this.userModel.findOne({
      email: email
    });
  }

  async authenticate(email: string, password: string) {
    const account = await this.userModel.findOne({
      email,
    }).select('+password');
    if (!account || !compareSync(password, account.password)) {
      throw new HttpException('Invalid email or password', HttpStatus.FORBIDDEN);
    }
    const accountJSON = account.toJSON();
    delete accountJSON.password;
    console.log(accountJSON);
    return accountJSON;
  }
}
