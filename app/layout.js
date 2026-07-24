import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'Financial Readiness Check™ by Michael Angelo Somosa',
  description: 'Free 60-second Financial Readiness Assessment - Discover how prepared you are for life\'s unexpected events. Get your personalized Financial Readiness Score and recommendations from Licensed Financial Advisor Michael Angelo Somosa.',
  keywords: 'financial readiness, financial planning, insurance assessment, financial advisor, Sun Life Financial, Michael Angelo Somosa',
  authors: [{ name: 'Michael Angelo Somosa' }],
  creator: 'Michael Angelo Somosa',
  openGraph: {
    title: 'Financial Readiness Check™',
    description: 'Take the FREE 60-second Financial Readiness Assessment',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}