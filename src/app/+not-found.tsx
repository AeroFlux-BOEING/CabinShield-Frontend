import { Redirect } from 'expo-router';

/** Unknown paths (including legacy `#config` style links) fall back to Overview. */
export default function NotFound() {
  return <Redirect href="/overview" />;
}
