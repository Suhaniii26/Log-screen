import { Text, View } from 'react-native';
import theme from '../theme';

export default function LogScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: theme.textPrimary, fontSize: 18 }}>Log Screen</Text>
    </View>
  );
}