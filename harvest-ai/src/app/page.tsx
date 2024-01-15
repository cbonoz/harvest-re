import { useMemo } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"

export default function Home() {
  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/PropertyMap"), {
        ssr: false,
        loading: () => <div>loading...</div>,
      }),
    []
  )
  return (
    <main className="flex h-screen items-center justify-center">
      <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
        <Map properties={[]} />
      </div>
    </main>
  )
}
