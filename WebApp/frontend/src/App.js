import React, { useEffect, useState } from 'react'

function App() {

  const [backendData, setBackendData] = useState([{}])

  useEffect(() => {
    fetch("/healthz").then(
      response => response.json()
    ).then(
      data => {
        setBackendData(data)
      }
    )
  }, [])

  return (
    <div className='App'>


      <p>{backendData.message}
      </p>

    </div>

  )
}

export default App