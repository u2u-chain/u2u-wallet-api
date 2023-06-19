import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";
import * as paginate from "mongoose-paginate-v2";
import { AutoIncrementID } from "@typegoose/auto-increment";

// const AutoIncrement = require('mongoose-sequence')(mongoose);

@Schema()
export class User extends Document {
  _id: string | mongoose.Schema.Types.ObjectId;

  @Prop({
    type: Number,
    index: true,
    auto: true
  })
  id: number;

  @Prop({ required: true })
  username: string;

  @Prop({
    required: true,
    trim: true,
    lowercase: true,
    unique: true
  })
  email: string;

  @Prop({
    type: String,
    trim: true,
    default: "https://i.imgur.com/Uoeie1w.jpg"
  })
  avatar: string;

  @Prop({
    trim: true,
    minlength: 8,
    maxlength: 100,
    select: false
  })
  password: string;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop()
  hederaPrivateKey: string;

  @Prop()
  hederaPublicKey: string;

  @Prop()
  hederaAccountId: string;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.plugin(paginate);
UserSchema.plugin(AutoIncrementID, {
  field: "id"
});
