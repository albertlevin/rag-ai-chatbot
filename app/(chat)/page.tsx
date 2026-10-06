import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Chat } from "@/components/chat";
import { DataStreamHander } from "@/components/data-stream-handler";
import { generateUUID } from "@/lib/utils";
import { auth } from "../(auth)/auth";

// Server component: creates a fresh chat id for every visit to /.
export default async function ChatHomePage() {

  const session = await auth();
  if (!session) {
    redirect("/api/auth/guest")
  }

  const id = generateUUID();

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get("chat-model");
  // key remounts <Chat> for each new chat id
  return (
    <>
      <Chat
        autoResume={false}
        id={id}
        initialMessages={[]}
        initialVisibilityType="private"
        isReadonly={false}
        key={id} />
      <DataStreamHander />
    </>
  )


}
