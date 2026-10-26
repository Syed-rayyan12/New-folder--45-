'use client'

import dynamic from 'next/dynamic'
import { Component } from 'react'

const Scene = dynamic(() => import('./hero-scene'), { ssr: false })
class SceneBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? null : this.props.children }
}
export function HeroVisual() {
  return <div className="hero-art" aria-hidden="true"><div className="tunnel-fallback" /><div className="sculpture-fallback" /><SceneBoundary><Scene /></SceneBoundary><div className="hero-art-shade" /></div>
}
