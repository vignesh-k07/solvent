import connect from "@/lib/db";
import User from "@/lib/modals/user";
import { PublicKey } from "@solana/web3.js";
import { NextResponse } from "next/server";
import nacl from "tweetnacl";
import jwt from "jsonwebtoken";

import bs58 from "bs58";
import { JWT_EXPIRATION, JWT_SECRET } from "@/utils/constants";

// export const GET = async () => {
//     try {
//         await connect();
//         const users = await User.find({});R̥
//         return new NextResponse(JSON.stringify(users))
//     } catch (error: any) {
//         return new NextResponse("Error in fetching users" + error.message, {status: 500})
//     }
// }

export const POST = async (req: Request) => {
  try {
    const { host, publicKey, nonce, signature, } = await req.json();

    const message = new TextEncoder().encode(
      `${
        host
      } wants you to sign in with your Solana account:\n${publicKey}\n\nPlease sign in to verify you are the owner of the wallet.\n\n${nonce}`
    );

    const result = nacl.sign.detached.verify(
      message,
      bs58.decode(signature),
      new PublicKey(publicKey).toBytes()
    );
console.log("result: " + result);
    if (!result) {
      return new NextResponse("Incorrect signature", { status: 411 });
    }

    await connect();

    const existingUser = await User.findOne({ publicKey });

    if (existingUser) {
      const token = jwt.sign(
        {
          userId: existingUser._id,
          publicKey: existingUser.publicKey,
        },
        JWT_SECRET
      );

      return new NextResponse(JSON.stringify({ token }), { status: 200 });
    } else {
      const user = new User({
        publicKey,
        signature,
      });
      await user.save();
      const token = jwt.sign(
        {
          userId: user.id,
        },
        JWT_SECRET,
        {
          expiresIn: JWT_EXPIRATION,
        }
      );
      return new NextResponse(JSON.stringify({ token }), { status: 200 });
    }
  } catch (error: any) {
    return new NextResponse("Error in signing in" + error.message, {
      status: 500,
    });
  }
};
