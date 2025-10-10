#!/usr/bin/env node
const crypto = require("crypto");
const body = process.argv[2] || "";
const secret = process.env.HMAC_SECRET || "dev-only-change-me";
process.stdout.write(crypto.createHmac("sha256", secret).update(body).digest("hex"));
