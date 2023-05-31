import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";
import * as paginate from "mongoose-paginate-v2";
import { AutoIncrementID } from "@typegoose/auto-increment";

@Schema()
export class HederaEncryptedAccessKey extends Document {
  _id: string | mongoose.Schema.Types.ObjectId;

  @Prop()
  publicKey: string;

  @Prop()
  encryptedKey: string;

  @Prop()
  userId: string;

  @Prop()
  hederaAccountId: string;
}

export type HederaEncryptedAccessKeyDocument = HederaEncryptedAccessKey & Document;
export const HederaEncryptedAccessKeySchema = SchemaFactory.createForClass(HederaEncryptedAccessKey);
