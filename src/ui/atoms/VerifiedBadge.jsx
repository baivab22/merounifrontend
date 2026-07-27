'use client'

const VerifiedBadge = ({ size = 'md', className = '' }) => {
  const sizes = {
    xs: { wrapper: 'w-3.5 h-3.5', svg: 'w-3.5 h-3.5', stroke: 2.5 },
    sm: { wrapper: 'w-4 h-4', svg: 'w-4 h-4', stroke: 2.2 },
    md: { wrapper: 'w-5 h-5', svg: 'w-5 h-5', stroke: 2 },
    lg: { wrapper: 'w-6 h-6', svg: 'w-6 h-6', stroke: 1.8 },
    xl: { wrapper: 'w-7 h-7', svg: 'w-7 h-7', stroke: 1.6 }
  }

  const s = sizes[size] || sizes.md

  return (
    <span
      className={`inline-flex items-center justify-center flex-shrink-0 ${s.wrapper} ${className}`}
      title='Verified'
    >
      <svg
        viewBox='0 0 24 24'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className={s.svg}
      >
        <circle cx='12' cy='12' r='12' fill='#1877F2' />
        <path
          d='M9.5 12.5L11 14L14.5 10.5'
          stroke='white'
          strokeWidth={s.stroke}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    </span>
  )
}

export default VerifiedBadge
