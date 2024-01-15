import dynamic from "next/dynamic"
import Link from "next/link"

const ClientMap = dynamic(() => import("@/components/PropertyMap"), {
  ssr: false,
  loading: () => <div>loading...</div>,
})

export default function Home() {
  return (
    <main className="flex h-screen items-center justify-center">
      <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
        <ClientMap properties={[]} />
      </div>
    </main>
  )
}
