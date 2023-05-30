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
  firstName: string;

  @Prop({ required: true })
  lastName: string;

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

  @Prop({ required: true })
  gender: string;

  @Prop({ required: true })
  dateOfBirth: Date;

  @Prop({ default: false })
  emailVerified: boolean;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.plugin(paginate);
UserSchema.plugin(AutoIncrementID, {
  field: "id"
});
