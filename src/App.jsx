import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { getPricing, PRICING_STORAGE_KEY } from './data/pricing'
import './App.css'
import Icon from './icon'
import ThreeViewer from './ThreeViewer'
import SectionTitle from './SectionTitle'
import { calculateQuote } from './utils'
import Configurator from './Configurator'
import Admin from './Admin'



function App() {
  const [pricing] = useState(() => getPricing())
  return window.location.pathname === '/admin' ? <Admin pricing={pricing} setPricing={() => { }} /> : <Configurator pricing={pricing} />
}

export default App
