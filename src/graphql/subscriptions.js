/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser {
    onCreateUser {
      id
      fileName
      createdBy
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
      fileName
      createdBy
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
      fileName
      createdBy
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
export const onCreateFile = /* GraphQL */ `
  subscription OnCreateFile {
    onCreateFile {
      id
      name
      file {
        bucket
        region
        key
      }
      owners
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateFile = /* GraphQL */ `
  subscription OnUpdateFile {
    onUpdateFile {
      id
      name
      file {
        bucket
        region
        key
      }
      owners
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteFile = /* GraphQL */ `
  subscription OnDeleteFile {
    onDeleteFile {
      id
      name
      file {
        bucket
        region
        key
      }
      owners
      createdAt
      updatedAt
    }
  }
`;
