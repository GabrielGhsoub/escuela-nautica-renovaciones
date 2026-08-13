import React from 'react'
import { createRoot } from 'react-dom/client'
/* theme.css is the shared base and app.css is this page's override, so theme
   must land first. It used to be imported after App.jsx, which meant every
   shared class in app.css lost an equal-specificity tie to the template. That
   is how the "Atras" button ended up white on white. */
import './fonts.css'
import './theme.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>)
