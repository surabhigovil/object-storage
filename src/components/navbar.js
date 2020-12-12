import React from 'react';
import styles from '../css/navbar.module.css';
import {Auth } from 'aws-amplify'
import { Button } from 'react-bootstrap';

async function signOut() {
    try {
      await Auth.signOut();
      window.location.reload();
    } catch (error) {
      console.log('Error signing out: ', error);
    }
}

class NavBar extends React.Component {
  render() {
    return (
        <div className={ styles.margin }>
            <div className={ styles.navbar }>
                <div className={ styles.navbar }>
                    <p className={ styles.brand }>Dossier</p>
                    <Button data-test="sign-out-button" onClick={signOut} className={styles.navbtn }>Sign Out</Button>
                </div>
            </div>
        </div>
    );
  }
}

export default NavBar;