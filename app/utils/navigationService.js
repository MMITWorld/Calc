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

const findActiveRoute = (navState) => {
  if (!navState || !navState.routes || typeof navState.index !== 'number') return null;
  const route = navState.routes[navState.index];
  if (route && route.routes) return findActiveRoute(route);
  return route || null;
};

export const getCurrentRoute = () => {
  if (!navigatorRef) return null;
  const navState =
    (navigatorRef.state && navigatorRef.state.nav) ||
    (navigatorRef._navigation && navigatorRef._navigation.state && navigatorRef._navigation.state.nav) ||
    null;
  return findActiveRoute(navState);
};

export const getCurrentRouteName = () => {
  const route = getCurrentRoute();
  return route ? route.routeName : null;
};
