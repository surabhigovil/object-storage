import React, { useState, useReducer, useEffect } from 'react'
import { AmplifySignOut, withAuthenticator } from '@aws-amplify/ui-react';
import Amplify, {Auth, Storage, API, graphqlOperation } from 'aws-amplify'
import { v4 as uuid } from 'uuid'

import { createUserFiles as CreateUserFiles } from './graphql/mutations'
import { listUserFiless as ListUserFiles } from './graphql/queries'
import config from './aws-exports'

Amplify.configure(config);

const {
  aws_user_files_s3_bucket_region: region,
  aws_user_files_s3_bucket: bucket
} = config

function App() {
  const [file, updateFile] = useState(null)
  const [fileName, updateFileName] = useState('')
  const [files, updateFiles] = useState([])
  useEffect(() => {
    listUserFiles()
  }, [])
  
  async function listUserFiles() {
    const files = await API.graphql(graphqlOperation(ListUserFiles))
    updateFiles(files.data.listUserFiless.items)
  }

  function handleChange(event) {
    const { target: { value, files } } = event
    const fileForUpload = files[0]
    updateFileName(fileForUpload.name[0])
    updateFile(fileForUpload || value)
  }

  async function createUserFiles(event) {
    event.preventDefault()
    if (file) {
      const extension = file.name.split(".")[1]
      const { type: mimeType } = file
      const key = `images/${uuid()}${fileName}.${extension}`      
      const url = `https://${bucket}.s3.${region}.amazonaws.com/public/${key}`
      const inputData = { name: fileName , image: url }
      
      try {
        await Storage.put(key, file, {
          contentType: mimeType
        })
        await API.graphql(graphqlOperation(CreateUserFiles, { input: inputData }))
        console.log('successfully created file!')
      } catch (err) {
        console.log('error: ', err)
      }
    }
  }

  return (
    <div style={styles.container}>
      <input
        type="file"
        onChange={handleChange}
        style={{margin: '10px 0px'}}
      />
      <input
        placeholder='File Name'
        value={fileName}
        onChange={e => updateFileName(e.target.value)}
      />
      <button
        style={styles.button}
        onClick={createUserFiles}>Create File</button>

      {
        files.map((p, i) => (
          <p>{p.name}</p>
        ))
      }
      <AmplifySignOut />
    </div>
  );
}

const styles = {
  container: {
    width: 400,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column'
  },
  image: {
    width: 400
  },
  button: {
    width: 200,
    backgroundColor: '#ddd',
    cursor: 'pointer',
    height: 30,
    margin: '0px 0px 8px'
  }
}

export default withAuthenticator(App);