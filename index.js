import {
  connect,
  getStatus,
  initData,
  readMemory,
} from './board.js'


let connectButton, statusButton, initButton, readButton


const connectHandler = async(event)=>{
  try {
    await connect()
  } catch (error) {
    console.error(error)
  }
}


const initHandler = async(event)=>{
  try {
    await initData()
  } catch (error) {
    console.error(error)
  }
}


const statusHandler = async(event)=>{
  try {
    await getStatus()
  } catch (error) {
    console.error(error)
  }
}


const readHandler = async(event)=>{
  try {
    await readMemory()
  } catch (error) {
    console.error(error)
  }
}


window.addEventListener('load', async(event)=>{
  connectButton = document.getElementById('connect-button')
  statusButton = document.getElementById('status-button')
  initButton = document.getElementById('init-button')
  readButton = document.getElementById('read-button')

  connectButton.addEventListener('click', connectHandler)
  statusButton.addEventListener('click', statusHandler)
  initButton.addEventListener('click', initHandler)
  readButton.addEventListener('click', readHandler)
})