/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import { Root } from './app/routes/router'
import codePush from "react-native-code-push";
const options = {
  updateDialog: false,
  installMode: codePush.InstallMode.IMMEDIATE,
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME
};
class App extends Component {
  codePushStatusDidChange(status) {
    switch(status) {
        case codePush.SyncStatus.CHECKING_FOR_UPDATE: 
            console.log("Checking for updates.");
            break;
        case codePush.SyncStatus.DOWNLOADING_PACKAGE: 
            console.log("Downloading package.");
            break;
        case codePush.SyncStatus.INSTALLING_UPDATE: 
            console.log("Installing update.");
            break;
        case codePush.SyncStatus.UP_TO_DATE: 
            console.log("Up-to-date.");
            break;
        case codePush.SyncStatus.UPDATE_INSTALLED: 
            console.log("Update installed. ok");
            break;
    }
  }
  componentDidMount(){
    this.syncCodePush()
    codePush.allowRestart();
    codePush.notifyAppReady();
  }
  syncCodePush(){
    codePush.sync(options);
  }
  render() {
    return (
      <Root/>
    );
  }
}
App = codePush(options)(App);
export default App;