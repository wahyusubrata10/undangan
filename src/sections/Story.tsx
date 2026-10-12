import { useApp } from '@/context'
import { wedding } from '@/config/wedding'
import { Section, SectionTitle } from '@/components/Section'
import SmartImage from '@/components/SmartImage'
import { JanurLine } from '@/ornaments'

/**
 * 6 · Love story singkat — editorial vertikal, crop asimetris kiri/kanan selang-seling.
 * Parallax berlapis: foto (lambat) · teks (sedang) · tahun besar (cepat). Aksen: janur vertikal.
 */
export default function Story() {
  const { t, c } = useApp()
  const chapters = wedding.story.chapters
  if (!wedding.story.enabled || chapters.length === 0) return null

  return (
    <Section id="story" tone="cream" label={t.nav.story} className="overflow-hidden px-6 py-32">
      <JanurLine length={900} className="pointer-events-none absolute left-1/2 top-40 h-[calc(100%-16rem)] w-4 -translate-x-1/2 opacity-40" />
      <SectionTitle label={t.storySub} title={t.storyTitle} />
      <div className="relative mx-auto mt-24 flex max-w-3xl flex-col gap-28">
        {chapters.map((ch, i) => {
          const right = i % 2 === 1
          return (
            <article key={i} className={`relative flex flex-col ${right ? 'items-end text-right' : 'items-start text-left'}`}>
              <span className={`accent pointer-events-none absolute -top-10 text-[5.5rem] leading-none text-prada/25 ${right ? 'left-0' : 'right-0'}`} data-parallax="0.35" aria-hidden="true">
                {c(ch.date)}
              </span>
              <div className="w-[78%] overflow-hidden md:w-[58%]" data-curtain>
                <div>
                  <SmartImage photo={ch.photo} alt={c(ch.title)} label={`${t.photo} · ${c(ch.date)}`} ratio="4/5" sizes="(min-width:768px) 420px, 78vw" className="w-full" />
                </div>
              </div>
              <div className={`relative mt-7 max-w-sm ${right ? 'pr-1' : 'pl-1'}`} data-parallax="0.08">
                <p className="label" data-anim="fade">
                  {c(ch.date)}
                </p>
                <h3 className="display-i mt-2 text-[2.4rem] text-ink" data-anim="lines">
                  {c(ch.title)}
                </h3>
                <p className="mt-3 text-[14px] text-ink-soft" data-anim="lines">
                  {c(ch.text)}
                </p>
              </div>
            </article>
          )
        })}
      </div>
    </Section>
  )
}
