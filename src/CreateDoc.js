import React, { useState, useReducer, useEffect } from 'react'
import { AmplifySignOut, withAuthenticator } from '@aws-amplify/ui-react';
import Amplify, {Auth, Storage, API, graphqlOperation } from 'aws-amplify'
import { v4 as uuid } from 'uuid'

import { createDocument } from './graphql/mutations'
import { listDocuments as ListDocuments } from './graphql/queries'
import { onCreateDocument } from './graphql/subscriptions'
import config from './aws-exports'

Amplify.configure(config);

const {
  aws_user_files_s3_bucket_region: region,
  aws_user_files_s3_bucket: bucket
} = config

const initialState = {
  docs: []
}

function reducer(state, action) {
  switch(action.type) {
    case 'SET_DOC':
      return { ...state, docs: action.docs }
    case 'ADD_DOC':
      return { ...state, docs: [action.doc, ...state.docs] }
    default:
      return state
  }
}

function App() {
    const [file, updateFile] = useState(null)
    const [signedInUser, updateUser] = useState('')
    const [fileName, updateFileName] = useState('')
    const [files, updateFiles] = useState([])
    const [state, dispatch] = useReducer(reducer, initialState)
    const [fileUrl, updateDocUrl] = useState('')
  
    function handleChange(event) {
      const { target: { value, files } } = event
      const fileForUpload = files[0]
      const user = Auth.currentAuthenticatedUser()
      updateUser(user.username)
      updateFileName(fileForUpload.name[0])
      updateFile(fileForUpload || value)
    }

    async function fetchImage(key) {
      try {
        const imageData = await Storage.get(key, {level: 'private'})
        console.log(imageData)
        updateDocUrl(imageData)
      } catch(err) {
        console.log('error: ', err)
      }
    }
    
    async function fetchDocs() {
      try {
       let docs = await API.graphql(graphqlOperation(ListDocuments))
       docs = docs.data.listDocuments.items
       dispatch({ type: 'SET_DOCS', docs })
      } catch(err) {
        console.log('error fetching docs')
      }
    }

    async function CreateFile(event) {
      event.preventDefault()
      if (file) {
        const extension = file.name.split(".")[1]
        // const url = `https://${bucket}.s3.${region}.amazonaws.com/public/${key}`
        const { name: fileName, type: mimeType } = file  
        const key = `${uuid()}${fileName}`
        const url = `https://${bucket}.s3.${region}.amazonaws.com/public/${key}`
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
          await API.graphql(graphqlOperation(createDocument, { input: inputData }))
          console.log('successfully created file!')
        } catch (err) {
          console.log('error: ', err)
        }
      }
    }

    useEffect(() => {
      fetchDocs()
      const subscription = API.graphql(graphqlOperation(onCreateDocument))
        .subscribe({
          next: async docData => {
            const { onCreateDocument } = docData.value.data
            dispatch({ type: 'ADD_DOCS', doc: onCreateDocument })
          }
        })
      return () => subscription.unsubscribe()
    }, [])

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
        state.docs.map((u, i) => {
          return (
            <div
              key={i}
            >
              <p
                style={styles.username}
               onClick={() => fetchImage(u.fileLocation.key)}>{u.name}</p>
            </div>
          )
        })
      }
      <img
        src={fileUrl}
        style={{ width: 300 }}
      />
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
  
  export default withAuthenticator(App, { includeGreetings: true });