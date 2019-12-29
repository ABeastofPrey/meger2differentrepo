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

export const environment = {
  production: true,
  appName: 'ControlStudio+',
  appName_Kuka: 'KUKA.ControlStudio',
  api_url: 'http://' + window.location.hostname + ':1207',
  ip: window.location.hostname,
  gui_ver: 'v1.2.5 2019-12-29',
  compatible_webserver_ver: 'v3.2.6',
  platform: PLATFORMS.Kuka,
  platforms: PLATFORMS,
};
