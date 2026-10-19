export function BrandMark({ className = 'size-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} role="img" aria-label="Talverin">
      <rect width="512" height="512" rx="118" fill="#101010" />
      <path d="M96 130h320v76H316v186H196V206H96v-76z" fill="#CDE06A" />
    </svg>
  )
}
