import React from 'react';
import {
  View,
  StatusBar,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
  Animated,
  Easing
} from 'react-native';
import { 
    createAppContainer,
    createSwitchNavigator,
    addNavigationHelpers
} from "react-navigation";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SafeAreaView from 'react-native-safe-area-view';
import { createStackNavigator } from 'react-navigation-stack';
import Break from '../pages/breaks.js';
import Sale from '../pages/sale.js';
import Sale2D from '../pages/sale_2d.js';
import Sale3D from '../pages/sale_3d.js';
import Sale4D from '../pages/sale_4d.js';
import CutOption from '../pages/cut_option.js';
import CutDot from '../pages/cut_dot.js';
import CutView from '../pages/cut_view.js';
import Ledger from '../pages/ledger.js';
import CleanFile from '../pages/cleanfile.js';
import Report from '../pages/report.js';
import Main from '../pages/main.js'
import Users from '../pages/users.js';
import Terms from '../pages/terms.js';
import Home from '../pages/home.js';
import Login from '../pages/login.js';
import Splash from '../pages/splash.js';
import Setting from '../pages/setting.js';
import Slip from '../pages/slip.js';
import SlipLog from '../pages/slip_log.js';
import SlipLogDetails from '../pages/slip_log_details.js';
import SlipDetails from '../pages/slip_details.js';
import UserSetting from '../pages/user_setting.js';
import MoneyInOut from '../pages/money_in_out';
import MoneyInOutList from '../pages/money_in_out_list';
import RemainList from '../pages/remain_list';
import TransferList from '../pages/transfer_list';
import ChatList from '../pages/chat_list.js';
import ChatRoom from '../pages/chat_room.js';
import Color from '../utils/Color.js'
import { createDrawerNavigator } from 'react-navigation-drawer';
import AssistantMenu from '../components/assistant_menu.js';
import { setNavigator } from '../utils/navigationService';
let SlideFromRight = (index, position, width) => {
  const inputRange = [index - 1, index, index + 1];
  const translateX = position.interpolate({
    inputRange: [index - 1, index, index + 1],
    outputRange: [width, 0, 0]
  })
  const slideFromRight = { transform: [{ translateX }] }
  return slideFromRight
};
const TransitionConfiguration = () => {
  return {
    transitionSpec: {
      duration: 750,
      easing: Easing.out(Easing.poly(4)),
      timing: Animated.timing,
      useNativeDriver: true,
    },
    screenInterpolator: (sceneProps) => {
      const { layout, position, scene } = sceneProps;
      const width = layout.initWidth;
      const { index, route } = scene
      const params = route.params || {}; // <- That's new
      const transition = params.transition || 'default'; // <- That's new
      return SlideFromRight(index, position, width)
    },
  }
}
  const MainStack = createStackNavigator(
    {
      Home: {
        screen: Home,
      },
      Users: {
        screen: Users,
      },
      Terms: {
        screen: Terms,
      },
      Break: {
        screen: Break,
      },
      CleanFile: {
        screen: CleanFile,
      },
      Ledger: {
        screen: Ledger,
      },
      CutOption: {
        screen: CutOption,
      },
      CutDot: {
        screen: CutDot,
      },
      CutView: {
        screen: CutView,
      },
      Slip: {
        screen: Slip,
      },
      SlipDetails: {
        screen: SlipDetails,
      },
      Report: {
        screen: Report,
      },
      Sale: {
        screen: Sale,
      },
      Sale2D: {
        screen: Sale2D,
      },
      Sale3D: {
        screen: Sale3D,
      },
      Sale4D: {
        screen: Sale4D,
      },
      SlipLog: {
        screen: SlipLog,
      },
      SlipLogDetails: {
        screen: SlipLogDetails,
      },
      UserSetting: {
        screen: UserSetting,
      },
      MoneyInOut: {
        screen: MoneyInOut,
      },
      MoneyInOutList:{
        screen:MoneyInOutList
      },
      RemainList:{
        screen:RemainList
      },
      TransferList:{
        screen:TransferList
      },
      ChatRoom:{
        screen:ChatRoom
      },
      Main: Main,
      Login: {
        screen: Login,
      },
      Setting: {
        screen: Setting,
      },
    },
    {
      
      initialRouteName: "Main",
      transitionConfig: TransitionConfiguration,
      defaultNavigationOptions: {
        //gesturesEnabled: true,
        header:null
      }
    }
  );
  const ChatStack = createStackNavigator(
    {
      ChatList: { screen: ChatList },
      ChatRoom: { screen: ChatRoom },
    },
    {
      defaultNavigationOptions: { header: null }
    }
  );
  const DrawerNav = createDrawerNavigator(
    {
      Home: { screen: MainStack },
      Chat: { screen: ChatStack },
    },
    {
      initialRouteName: 'Home'
    }
  );
  const LoginNavigator = createStackNavigator(
    {
      LoGIN: {
        screen: Login,
      },
      Setting: {
        screen: Setting,
      },
    },
    {
      
      initialRouteName: "LoGIN",
      transitionConfig: TransitionConfiguration,
      defaultNavigationOptions: {
        //gesturesEnabled: true,
        header:null
      }
    }
  );
  const AppConatiner= createAppContainer(createSwitchNavigator(
    {
      Splash: Splash,
      AppNavigator: DrawerNav,
    },
    {
      initialRouteName: 'Splash',
    }
  ));
  export const Root = () =>
  <View style={{flex: 1}}>
    <StatusBar 
    backgroundColor = {Color.DARKPRIMARYCOLOR}
    barStyle        = "light-content"
    />
   <AppConatiner ref={(ref) => setNavigator(ref)} />
   <AssistantMenu />
  </View>;
