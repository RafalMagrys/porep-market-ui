import { ConnectButton } from '@rainbow-me/rainbowkit'

export const Nav = () => {
  return (
    <nav className="flex items-center justify-between border-b border-gray-200 p-4">
      <h3>PoRep Market</h3>
      <ConnectButton />
    </nav>
  )
}
