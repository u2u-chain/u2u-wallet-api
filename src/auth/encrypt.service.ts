import { Injectable } from "@nestjs/common";
import * as crypto from "crypto";

@Injectable()
export class EncryptService {
  constructor() {
  }

  async generateKeyPair() {
    const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: "spki",
        format: "der"
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "der"
      }
    });

    return { privateKey, publicKey };
  }

  async decryptPrivateKey(encryptedData, privateKeyDer) {
    const privateKeyDER = Buffer.from(privateKeyDer, "base64");
    const decryptor = crypto.createPrivateKey({
      key: privateKeyDER,
      format: "der",
      type: "pkcs8"
    });
    const encryptedBuffer = Buffer.from(encryptedData, "base64");
    const decryptedBuffer = crypto.privateDecrypt(decryptor, encryptedBuffer);

    return decryptedBuffer.toString("utf8");
  }

  async encryptPrivateKey(plaintext, publicKey) {
    const publicKeyDER = Buffer.from(publicKey, "base64");
    const encryptor = crypto.createPublicKey({
      key: publicKeyDER,
      format: "der",
      type: "spki"
    });
    const encryptedBuffer = crypto.publicEncrypt(encryptor, Buffer.from(plaintext, "utf8"));
    return encryptedBuffer.toString("base64");
  }

  async encryptPrivateKeyWithPassword(plaintextData: string, password: string) {
    const key = crypto.pbkdf2Sync(password, "", 100000, 32, "sha256");
    const iv = Buffer.alloc(16);

    const encryptor = crypto.createCipheriv("aes-256-ctr", key, iv);
    encryptor.setEncoding("hex");

    let encryptedData = encryptor.update(plaintextData, "utf8", "hex");
    encryptedData += encryptor.final("hex");

    return encryptedData;
  }

  async decryptPrivateKeyWithPassword(encryptedData: string, password: string) {
    const key = crypto.pbkdf2Sync(password, "", 100000, 32, "sha256");
    const iv = Buffer.alloc(16);

    const decipher = crypto.createDecipheriv("aes-256-ctr", key, iv);
    decipher.setEncoding("utf8");

    let decryptedData = decipher.update(encryptedData, "hex", "utf8");
    decryptedData += decipher.final("utf8");

    return decryptedData;
  }
}
