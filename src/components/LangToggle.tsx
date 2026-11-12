import { useLang } from '../i18n/LangContext';
import { Segmented } from './ui/Controls';

/** EN / 한국어 switch. */
export function LangToggle() {
  const { lang, setLang } = useLang();
  return <Segmented label="Language / 언어" value={lang} onChange={setLang} options={[{ value: 'en', label: 'EN' }, { value: 'ko', label: '한국어' }]} />;
}
