import { Link } from 'react-router-dom'

const points = [
  {
    title: 'Pitch',
    text: 'Founders post the idea, the price hint, and a mockup before they spend months building it.',
  },
  {
    title: 'Vote',
    text: 'People vote Go or No and say what to change while the product can still change.',
  },
  {
    title: 'Pre-book',
    text: 'When interest is real, founders can ask the community to reserve a spot.',
  },
]

export default function LandingPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 pb-16">
      <p className="text-xs font-semibold tracking-[0.16em] text-[#6b645b] uppercase">
        Product validation
      </p>
      <h1 className="mt-3 max-w-3xl font-serif text-5xl leading-none tracking-tight sm:text-7xl">
        Let the market decide before you build.
      </h1>
      <p className="mt-5 max-w-xl text-lg text-[#3f3a34]">
        GoOrNo is where founders test a launch and the community votes, suggests, and
        reserves a spot early.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/register?role=user"
          className="rounded-full bg-[#0f7a45] px-5 py-3 text-sm font-semibold text-white"
        >
          Sign up as a Backer
        </Link>
        <Link
          to="/register?role=founder"
          className="rounded-full bg-[#1c1915] px-5 py-3 text-sm font-semibold text-[#fffdf8]"
        >
          Launch your idea
        </Link>
        <Link to="/explore" className="rounded-full px-5 py-3 text-sm font-semibold">
          Browse ideas
        </Link>
      </div>
      <section className="mt-14 grid gap-4 sm:grid-cols-3">
        {points.map((point) => (
          <article
            key={point.title}
            className="rounded-3xl border border-[#e4dccf] bg-[#fffdf8] p-5"
          >
            <h2 className="font-serif text-2xl">{point.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#3f3a34]">{point.text}</p>
          </article>
        ))}
      </section>
    </main>
  )
}
