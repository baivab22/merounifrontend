import { Poppins } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Toaster } from '@/ui/shadcn/toaster'
import ReduxProvider from '../ui/molecules/ReduxProvider'
import ReactQueryContainer from '@/container/HOC/ReactQueryContainer'
import BProgressProvider from '../ui/molecules/BProgressProvider'

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700']
})

export const metadata = {
  title: {
    default: 'MeroUni | Your Education Path',
    template: '%s | MeroUni'
  },
  description: 'MeroUni is Nepal\'s leading education platform to search, compare, and choose colleges, courses, and scholarships.',
  openGraph: {
    title: 'MeroUni | Search, Compare and Choose Your Best Education Path',
    description: 'Explore Nepal’s colleges, courses, scholarships and education opportunities on Merouni.',
    url: 'https://merouni.com',
    siteName: 'MeroUni',
    images: [
      {
        url: 'https://merouni.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'MeroUni Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MeroUni | Your Education Path',
    description: 'Explore Nepal’s colleges, courses, scholarships and education opportunities on Merouni.',
    images: ['https://merouni.com/images/logo.png'],
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={`${poppins.variable} font-sans antialiased`}>
        <ReduxProvider>
          <ReactQueryContainer>
            <BProgressProvider>
              <main>{children}</main>
            </BProgressProvider>
            <Toaster />
          </ReactQueryContainer>
        </ReduxProvider>
        <Script
          src='https://www.googletagmanager.com/gtag/js?id=G-C5JXZHZZC2'
          strategy='afterInteractive'
        />
        <Script id='google-analytics' strategy='afterInteractive'>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-C5JXZHZZC2');
          `}
        </Script>
      </body>
    </html>
  )
}
