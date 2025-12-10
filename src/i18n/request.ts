import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale;

  if (!locale || !['en', 'th', 'cn', 'ru'].includes(locale)) {
    locale = 'en';
  }

  let messages;
  try {
    // console.log(`[i18n] Loading messages for locale: ${locale}`);
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`[i18n] Error loading messages for locale ${locale}:`, error);
    // Fallback to empty messages or English to prevent crash
    messages = {};
  }

  return {
    locale,
    messages
  };
});
