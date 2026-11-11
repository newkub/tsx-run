import { createSignal } from 'solid-js'
import { format } from 'date-fns'

export default function App() {
  const [count, setCount] = createSignal(0)
  return (
    <main class="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <section class="space-y-4 text-center">
        <h1 class="text-3xl font-bold">Hello TSX Run</h1>
        <p class="text-slate-400">SolidJS + UnoCSS</p>
        <p>{format(new Date(), 'PP')}</p>
        <i class="i-mdi-home text-2xl" />
        <button
          class="rounded-lg bg-blue-600 px-5 py-2 hover:bg-blue-500"
          onClick={() => setCount(count() + 1)}
        >
          Count: {count()}
        </button>
      </section>
    </main>
  )
}
