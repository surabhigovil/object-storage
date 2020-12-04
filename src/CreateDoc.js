import React, { useState, useReducer, useEffect } from 'react'
import { AmplifySignOut, withAuthenticator } from '@aws-amplify/ui-react';
import Amplify, {Auth, Storage, API, graphqlOperation } from 'aws-amplify'
import { v4 as uuid } from 'uuid'

import { createDocument as CreateDoc } from './graphql/mutations'
import { listDocuments as ListDocuments } from './graphql/queries'
import config from './aws-exports'

Amplify.configure(config);

const {
  aws_user_files_s3_bucket_region: region,
  aws_user_files_s3_bucket: bucket
} = config


function App() {
    const [file, updateFile] = useState(null)
    const [signedInUser, updateUser] = useState('')
    const [fileName, updateFileName] = useState('')
    const [files, updateFiles] = useState([])
    useEffect(() => {
        listDocs()
    }, [])
    
    async function listDocs() {
      const files = await API.graphql(graphqlOperation(ListDocuments))
      updateFiles(files.data.listDocuments.items)
    }
  
    function handleChange(event) {
      const { target: { value, files } } = event
      const fileForUpload = files[0]
      const user = Auth.currentAuthenticatedUser()
      updateUser(user.username)
      updateFileName(fileForUpload.name[0])
      updateFile(fileForUpload || value)
    }
  
    async function CreateFile(event) {
      event.preventDefault()
      if (file) {
        const extension = file.name.split(".")[1]
        // const url = `https://${bucket}.s3.${region}.amazonaws.com/public/${key}`
        const { name: fileName, type: mimeType } = file  
        const key = `${uuid()}${fileName}`
        const fileForUpload = {
            bucket,
            key,
            region,
        }

        const inputData = { name: fileName , fileLocation: fileForUpload, localowner: signedInUser}
        
        try {
          await Storage.put(key, file, {
            contentType: mimeType
          })
          await API.graphql(graphqlOperation(CreateDoc, { input: inputData }))
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
        onClick={CreateFile}>Create File</button>

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