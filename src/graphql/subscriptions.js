/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser {
    onCreateUser {
      id
      username
      file {
        bucket
        region
        key
      }
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser {
    onUpdateUser {
      id
      username
      file {
        bucket
        region
        key
      }
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser {
    onDeleteUser {
      id
      username
      file {
        bucket
        region
        key
      }
      createdAt
      updatedAt
    }
  }
`;
export const onCreateDocument = /* GraphQL */ `
  subscription OnCreateDocument {
    onCreateDocument {
      id
      name
      fileLocation {
        bucket
        region
        key
      }
      localowner
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateDocument = /* GraphQL */ `
  subscription OnUpdateDocument {
    onUpdateDocument {
      id
      name
      fileLocation {
        bucket
        region
        key
      }
      localowner
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteDocument = /* GraphQL */ `
  subscription OnDeleteDocument {
    onDeleteDocument {
      id
      name
      fileLocation {
        bucket
        region
        key
      }
      localowner
      createdAt
      updatedAt
    }
  }
`;
