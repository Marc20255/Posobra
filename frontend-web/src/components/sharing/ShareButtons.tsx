'use client'

import { Facebook, Twitter, Linkedin, Link2, Copy } from 'lucide-react'
import { useState } from 'react'

interface ShareButtonsProps {
  url: string
  title: string
  description?: string
}

export function ShareButtons({ url, title, description }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const shareUrl = typeof window !== 'undefined' ? window.location.origin + url : url
  const shareText = description || title

  const shareOnFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'width=600,height=400'
    )
  }

  const shareOnTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      '_blank',
      'width=600,height=400'
    )
  }

  const shareOnLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'width=600,height=400'
    )
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-600">Compartilhar:</span>
      <button
        onClick={shareOnFacebook}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Compartilhar no Facebook"
      >
        <Facebook className="w-5 h-5 text-blue-600" />
      </button>
      <button
        onClick={shareOnTwitter}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Compartilhar no Twitter"
      >
        <Twitter className="w-5 h-5 text-blue-400" />
      </button>
      <button
        onClick={shareOnLinkedIn}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Compartilhar no LinkedIn"
      >
        <Linkedin className="w-5 h-5 text-blue-700" />
      </button>
      <button
        onClick={copyToClipboard}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Copiar link"
      >
        {copied ? (
          <Copy className="w-5 h-5 text-green-600" />
        ) : (
          <Link2 className="w-5 h-5 text-gray-600" />
        )}
      </button>
    </div>
  )
}

