export interface Platform {
  name: string;
  logo: string;
  spinner: string;
}

export const Kuka: Platform = {
  name: 'kuka',
  logo: 'kuka.png',
  spinner: 'kuka-spinner.gif', // Must be 64 by 64 px
};

export const Servotronix: Platform = {
  name: 'stx',
  logo: 'cs_stx.png',
  spinner: 'logo_only.gif', // Must be 64 by 64 px
};

export const Platforms = {
  Kuka: Kuka,
  Servotronix: Servotronix,
};

export const environment = {
  production: true,
  appName: 'ControlStudio+',
  appName_Kuka: 'KUKA.ControlStudio',
  api_url: 'http://' + window.location.hostname + ':1207',
  ip: window.location.hostname,
  gui_ver: 'v1.2.0 2019-10-23',
  compatible_webserver_ver: 'v3.2.3',
  platform: Platforms.Kuka,
  platforms: Platforms,
};
