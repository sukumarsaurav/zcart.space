'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export interface FaqItem {
  question: string
  answer: string
}

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="mkt-faq">
      {items.map((item, i) => {
        const isOpen = openIndex === i
        return (
          <div key={item.question} className="card">
            <button
              className="mkt-faq-q"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
            >
              <span>{item.question}</span>
              <ChevronDown size={18} />
            </button>
            {isOpen && <p className="mkt-faq-a">{item.answer}</p>}
          </div>
        )
      })}
    </div>
  )
}
