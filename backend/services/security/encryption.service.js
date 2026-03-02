import crypto from "crypto";
const ALGORITHM = "aes-256-cbc";
const SECRET = process.env.API_KEY_SECRET;

const KEY = Buffer.from(SECRET,"hex");

export const encrypt = (text) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
        ALGORITHM,
        KEY,
        iv
    );

    let encrypted = cipher.update(text,"utf8");
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
};  

export const decrypt = (encryptedText) => {
    const [ivHex, contentHex] = encryptedText.split(":");

    const iv = Buffer.from(ivHex, "hex");
    const encrypted = Buffer.from(contentHex, "hex");
    const decipher = crypto.createDecipheriv(
        ALGORITHM,
        KEY,
        iv
    );

    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};