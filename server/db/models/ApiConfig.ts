import mongoose, { Schema, Document } from "mongoose";
import crypto from "crypto";

export interface IApiConfig extends Document {
  userId: string;
  apiKey: string;
  secretKey: string; // Encrypted
  isActive: boolean;
  lastUsed?: Date;
  createdAt: Date;
  updatedAt: Date;
  decryptSecretKey(): string;
}

const ApiConfigSchema = new Schema<IApiConfig>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      default: "default_user",
    },
    apiKey: {
      type: String,
      required: true,
    },
    secretKey: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUsed: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Encryption key from environment or default (change in production!)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "your-32-character-secret-key!!";
const ALGORITHM = "aes-256-cbc";

// Encrypt secret key before saving
ApiConfigSchema.pre("save", function (next) {
  if (this.isModified("secretKey")) {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(
        ALGORITHM,
        Buffer.from(ENCRYPTION_KEY.slice(0, 32)),
        iv
      );
      let encrypted = cipher.update(this.secretKey, "utf8", "hex");
      encrypted += cipher.final("hex");
      this.secretKey = iv.toString("hex") + ":" + encrypted;
    } catch (error) {
      console.error("Encryption error:", error);
    }
  }
  next();
});

// Method to decrypt secret key
ApiConfigSchema.methods.decryptSecretKey = function (): string {
  try {
    const parts = this.secretKey.split(":");
    const iv = Buffer.from(parts[0], "hex");
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY.slice(0, 32)),
      iv
    );
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    return "";
  }
};

// Index for faster lookups
ApiConfigSchema.index({ userId: 1 });

export const ApiConfig = mongoose.model<IApiConfig>("ApiConfig", ApiConfigSchema);
