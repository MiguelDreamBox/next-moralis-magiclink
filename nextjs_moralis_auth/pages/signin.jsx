import { MagicConnector } from "@everipedia/wagmi-magic-connector";
import { signIn } from "next-auth/react";
import { useAccount, useConnect, useSignMessage, useDisconnect } from "wagmi";

import { useRouter } from "next/router";
import axios from "axios";

function SignIn() {
  const { connectAsync } = useConnect({
    connector: new MagicConnector({
      options: {
        apiKey: "pk_live_47B9059DA17DF6E7", //required
        oauthOptions: {
          callbackUrl: "http://localhost:3000/user", //optional
        },
        additionalMagicOPtions: { locale: "es" },
      },
    }),
  });

  const { disconnectAsync } = useDisconnect();
  const { isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { push } = useRouter();

  const handleAuth = async () => {
    if (isConnected) {
      await disconnectAsync();
    }

    const { account } = await connectAsync();

    const userData = {
      address: account,
      chain: "0x13881",
      network: "evm",
    };

    const { data } = await axios.post("/api/auth/request-message", userData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const message = data.message;

    const signature = await signMessageAsync({ message });

    // redirect user after success authentication to '/user' page
    const { url } = await signIn("credentials", {
      message,
      signature,
      redirect: false,
      callbackUrl: "/user",
    });
    /**
     * instead of using signIn(..., redirect: "/user")
     * we get the url from callback and push it to the router to avoid page refreshing
     */
    push(url);
  };

  return (
    <div>
      <h3>Web3 Authentication</h3>
      <button onClick={() => handleAuth()}>Authenticate via Magic.Link</button>
    </div>
  );
}

export default SignIn;
