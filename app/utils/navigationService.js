import { NavigationActions } from 'react-navigation';

let navigatorRef = null;

export const setNavigator = (ref) => {
  navigatorRef = ref;
};

export const navigate = (routeName, params) => {
  if (!navigatorRef || !routeName) return;
  navigatorRef.dispatch(
    NavigationActions.navigate({
      routeName,
      params,
    }),
  );
};

export const goBack = () => {
  if (!navigatorRef) return;
  try {
    navigatorRef.goBack(null);
  } catch (e) {}
};

