import { App } from './App'

const testApiKey = 'CMBPFNMXW0000WEV26EYE6TUT'
const prodAPiKey = 'CLQ8QXTRG00003MKP13FNB1TY'
const apiKey = testApiKey || prodAPiKey 

// Ensure there is a root element
let root = document.getElementById('app')
if (!root) {
  root = document.createElement('div')
  root.id = 'app'
  document.body.appendChild(root)
}

new App(root, apiKey, true)
