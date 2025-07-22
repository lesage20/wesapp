import { Drawer } from 'expo-router/drawer';
import CustomDrawerContent from '~/components/CustomDrawerContent';

const DrawerLayout = () => {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: 300,
        },
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: 'Main App',
        }}
      />
    </Drawer>
  );
};

export default DrawerLayout;
