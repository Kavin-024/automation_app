"use client"

import Image from "next/image"
import Link from "next/link"

interface SiteLogoProps {
  withText?: boolean
  className?: string
}

export function SiteLogo({ withText = true, className = "" }: SiteLogoProps) {
  return (
    <Link href="/dashboard" className={`inline-flex items-center gap-3 ${className}`}>
      <Image
        src="/site-logo.png"
        alt="BDC Acceptor logo"
        width={44}
        height={44}
        priority
        className="h-11 w-11 rounded-md object-contain"
      />
      {withText && (
        <span className="text-lg font-semibold tracking-tight text-foreground">
          BPO Auto Accept
        </span>
      )}
    </Link>
  )
}
