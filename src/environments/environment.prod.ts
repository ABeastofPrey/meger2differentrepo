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
  logo: 'stx.png',
  spinner: 'logo_only.gif', // Must be 64 by 64 px
};

export const Platforms = {
  Kuka: Kuka,
  Servotronix: Servotronix,
};

export const environment = {
  production: true,
  appName: 'ControlStudio+',
  api_url: 'http://' + window.location.hostname + ':1207',
  ip: window.location.hostname,
  tp_ver: '1.3.1.0',
  gui_ver: '1.1.3-internal',
  compatible_webserver_ver: '3.1.4',
  platform: Platforms.Kuka,
  platforms: Platforms,
};
