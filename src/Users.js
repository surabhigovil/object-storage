import React, { useState, useReducer, useEffect } from 'react'
import { Button, Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react'
import Amplify, {Auth, Storage, API, graphqlOperation } from 'aws-amplify'
import { v4 as uuid } from 'uuid'
import { createUser as CreateUser } from './graphql/mutations'
import { createFile as CreateFile } from './graphql/mutations'
import { listUsers, listFiles } from './graphql/queries'
import { onCreateUser } from './graphql/subscriptions'
import config from './aws-exports'
import * as queries from './graphql/queries';
import * as mutations from './graphql/mutations'

var AWS = require('aws-sdk');


const {
  aws_user_files_s3_bucket_region: region,
  aws_user_files_s3_bucket: bucket
} = config

const initialState = {
  users: [],
  myFiles: [],
  getCognitoUsers: []
}


function reducer(state, action) {
  switch(action.type) {
    case 'SET_USERS':
      return { ...state, users: action.users }
    case 'ADD_USER':
      return { ...state, users: [action.user, ...state.users] }
    default:
      return state
  }
}

function App() {
  const [file, updateFile] = useState(null)
  const [username, updateUsername] = useState('')
  const [signedInUser, updateUser] = useState('')
  const [state, dispatch] = useReducer(reducer, initialState)
  const [userGroup, setUserGroup] = useState('')
  const [signedIn, setUsername] = useState('')
  const [userToShare, setuserToShare] = useState('')

  //const [myFiles, setuserFiles] = useState('')


  function handleChange(event) {
    const { target: { value, files } } = event
    const [image] = files || []
    const user =  Auth.currentAuthenticatedUser()
    updateFile(image || value)
    updateUser(user.username)
  }
  
  async function fetchUsers() {
    try {
     let users = await API.graphql(graphqlOperation(listUsers))
     users = users.data.listUsers.items
     dispatch({ type: 'SET_USERS', users })
    } catch(err) {
      console.log('error fetching users')
    }
  }

  async function deleteFile(id) {
    if (id) {
      let res = await API.graphql(graphqlOperation(queries.listFiles, {id: id}));
      const result = {
        id: id
      }
    
      await API.graphql(graphqlOperation(mutations.deleteFile, {input: result }));

    } else {
      console.error("No file to delete")
    }
  }
  async function shareFile(id) { // share with other users
    let res = await API.graphql(graphqlOperation(queries.listFiles, {id: signedIn}));
    let tempList = res.data.listFiles.items

    if (userToShare) {
      // Split if mulitple user names provided
      console.log(userToShare)
      let userArr = splitUserList(userToShare)
      console.log('userArr = ', userArr)

      tempList.map((u) => {
        if (u.id == id) {
          let newOwnerList = u.owners.concat(userArr.map((user) => user ))

          try {
            const params =  {
              id: id, 
              owners: newOwnerList
            }
            let status = API.graphql(graphqlOperation(mutations.updateFile, {input: params}));
            console.log(JSON.stringify(status))
          } catch(err) {
            console.log('error fetching files', err)
          }
        }
      })
    } else {
      console.error('No user name provided')
    }
  }

  function splitUserList(userToShare) {
    return userToShare.trim().split(',').map((i) => i.trim())
  }

  async function getLoggedInUserFiles() { // get current user files
    try{
      let result = await API.graphql(graphqlOperation(queries.listFiles));
      let tempFile = result.data.listFiles.items
      const userNow = Auth.user.attributes.email
      let params;
      let fileOwners;
      console.log("signedUser=", userNow)
      tempFile.map((file) => {
        if(file.owners && file.owners.includes(userNow))
        {
          initialState.myFiles.push({
            id: file.id, 
            name: file.name
          })
        }
      })
    }catch(err) {
      console.log('error fetching files', err)
    }
  }

  async function createUser(event) {
    event.preventDefault()
    if (!username) return alert('please enter a username')
    if (file && username) {
        const { name: fileName, type: mimeType } = file  
        const key = `${uuid()}${fileName}`
        const fileForUpload = {
            bucket,
            key,
            region,
        }
        const inputData = { username, file: fileForUpload }
        const fileinputData = { name: file.name , file: fileForUpload, owners: signedInUser }

        try {
          await Storage.put(key, file, {
            contentType: mimeType,
            level: 'private'
          })
          await API.graphql(graphqlOperation(CreateUser, { input: inputData }))
          await API.graphql(graphqlOperation(CreateFile, { input: fileinputData }))
          updateUsername('')
          console.log('successfully stored user data!')
          window.location.reload()
        } catch (err) {
          console.log('error: ', err)
        }
    }
  }

  async function getUsersRegistered(){
    var params = {
      UserPoolId: 'us-east-1_HXLjuizhW',
      AttributesToGet: [
      'email',
      ],
    };
    AWS.config.update({ region: 'us-east-1', accessKeyId: 'AKIAZMEYBOJ3T4W7Q74X', secretAccessKey: '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' });
    var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
    cognitoidentityserviceprovider.listUsers(params, (err, data) => {
      if (err) {
        console.log(err);
      }
      else {
        console.log("data", data);
        initialState.getCognitoUsers = data
      }
    })
  }

  useEffect(() => {
    const user =  Auth.currentAuthenticatedUser();
    console.log('user: ', user);
    const group = Auth.user.signInUserSession.accessToken.payload["cognito:groups"]
    console.log('group: ', group);
    setUserGroup(group)
    fetchUsers()
    getLoggedInUserFiles()
    getUsersRegistered()
    const subscription = API.graphql(graphqlOperation(onCreateUser))
      .subscribe({
        next: async userData => {
          const { onCreateUser } = userData.value.data
          dispatch({ type: 'ADD_USER', user: onCreateUser })
        }
      })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <div style={styles.container}>
      { !userGroup ? (
        <div> Hello  </div>
      ) : (
        //state.getCognitoUsers.map((u,i) => {
          //return (
            <p>Hello</p>
          //)
        //})
      )}
      <div className="float-left">
        <input
          label="File to upload"
          type="file"
          onChange={handleChange}
          style={{margin: '10px 0px'}}
        />
        <div className="float-right">
          <input
            placeholder='File Name'
            value={username}
            onChange={e => updateUsername(e.target.value)}
          />
          <Button type="submit"
            style={styles.button}
            onClick={createUser}>Upload File</Button>
        </div>
      </div>
      <div className="float-right">
        <label>All Files
          {
            state.users.map((u, i) => {
              return (
                <div
                  key={i}
                >
                </div>
              )
            })
          } 
        </label>
        <Table striped bordered hover variant="dark">
          <thead>
            <tr>
              <th>Fiile</th>
              <th>Enter User Email to Share With</th>
              <th>Share File</th>
              <th>Delete File</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                {
                  state.myFiles.map((u, i) => {
                    return (
                        <p>{u.name}</p>
                    )
                  })
                }
              </td>
              <td>
                {
                  state.myFiles.map((u, i) => {
                    return (
                      <input onChange={event => setuserToShare(event.target.value)}></input>
                    )
                  })
                }
              </td>
              <td>
                {
                  state.myFiles.map((u, i) => {
                    return (
                      <Button onClick={() => shareFile(u.id)}>Share!</Button>
                    )
                  })
                }
              </td>
              <td>
                {
                  state.myFiles.map((u, i) => {
                    return (
                      <Button bsStyle="danger" onClick={() => deleteFile(u.id)}>Delete!</Button>
                    )
                  })
                }
              </td>
            </tr>
          </tbody>
        </Table>
      </div>
      <AmplifySignOut />
    </div>
  )
}

const styles = {
  container: {
    margin: '0 auto'
  },
  username: {
    cursor: 'pointer',
    border: '1px solid #ddd',
    padding: '5px 25px'
  }
}

export default withAuthenticator(App);