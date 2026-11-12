import { Redirect } from 'expo-router';

/** Legacy route from the Safety Kernel PoC. The crew app replaced it; links fall back to 운항 현황. */
export default function LegacyRoute() {
  return <Redirect href="/overview" />;
}
