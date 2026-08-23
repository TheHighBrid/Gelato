import type { Metadata } from 'next';
import './globals.css';
import SmoothScroll from '@/components/SmoothScroll';
export const metadata: Metadata = { title:'The Living Book — Melato', description:'A cinematic 31-frame editorial lookbook.', alternates:{canonical:'https://melato.ca/lookbook/the-living-book'}, openGraph:{title:'The Living Book — Melato',description:'The garment is the crime scene. The evidence speaks.',url:'https://melato.ca/lookbook/the-living-book',type:'website'} };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><SmoothScroll>{children}</SmoothScroll></body></html>}
