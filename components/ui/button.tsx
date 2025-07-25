import { ButtonHTMLAttributes } from 'react'
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: string
  size?: string
}

export function Button({ children, className, variant, size, ...props }: ButtonProps) {
  return (
    <button className={className} {...props}>{children}</button>
  )
}
