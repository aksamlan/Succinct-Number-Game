import NumberGame from "@/components/number-game"

export default function Home() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center p-4"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <NumberGame />
    </main>
  )
}

