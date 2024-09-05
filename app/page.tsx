import SolanaKeyGenerator from "@/components/KeyGenerator";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <main className="">
      <p className="text-xl font-semibold text-red-500 absolute top-2 left-[35%]">
        Make sure you have some SOL to perform on Devnet
      </p>
      <Navbar />
      <SolanaKeyGenerator />
    </main>
  );
}
