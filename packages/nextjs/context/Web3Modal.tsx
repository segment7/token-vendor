'use client'

import { wagmiAdapter, projectId, networks } from '~~/config/wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import React, { type ReactNode } from 'react'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'

// Set up queryClient
const queryClient = new QueryClient()

// Set up metadata
const metadata = {
  name: 'Scaffold-ETH 2',
  description: 'Built with 🏗 Scaffold-ETH 2',
  url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000', // origin must match your domain & subdomain
  icons: ['https://scaffoldeth.io/logo.svg']
}

// Create the modal
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  metadata,
  themeMode: 'light',
  features: {
    analytics: true // Optional
  },
  themeVariables: {
    '--w3m-accent': '#fc8d0d', // Using a nice orange color
  }
})

// Expose modal to global scope for programmatic access
if (typeof window !== 'undefined') {
  (window as any).modal = modal;
}

function ReownContextProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default ReownContextProvider 