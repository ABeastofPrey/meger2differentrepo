export interface Platform {
  name: string;
  logo: string;
  spinner: string;
}

export const KUKA: Platform = {
  name: 'kuka',
  logo: 'kuka.png',
  spinner: 'kuka-spinner.gif', // Must be 64 by 64 px
};

export const STX: Platform = {
  name: 'stx',
  logo: 'cs_stx.png',
  spinner: 'logo_only.gif', // Must be 64 by 64 px
};

export const PLATFORMS = {
  Kuka: KUKA,
  Servotronix: STX,
};

export const LANGS = {//support langurage
  cmn: 'cmn',
  en: 'en',
}

export const environment = {
  production: true,
  appName: 'ControlStudio+',
  appName_Kuka: 'KUKA.ControlStudio',
  api_url: null,
  ip: null,
  gui_ver: 'v1.6.8 2020-11-24',
  compatible_webserver_ver: 'v3.6.3',
  platform: PLATFORMS.Kuka,
  platforms: PLATFORMS,
  langs: LANGS,
  useDarkTheme: false
};
