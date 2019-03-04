export const KukaTheme : Theme = {
  name: 'kuka-theme',
  logo: 'kuka.png',
  spinner: 'kuka-spinner.gif' // Must be 64 by 64 px
};

export const ServotronixTheme : Theme = {
  name: 'stx',
  logo: 'stx.png',
  spinner: 'logo_only.gif' // Must be 64 by 64 px
};

export const environment = {
  production: true,
  appName: 'ControlStudio+',
  api_url: 'http://' + window.location.hostname + ':1207',
  ip: window.location.hostname,
  tp_ver: '1.3.1.0',
  gui_ver: '1.0.7',
  compatible_webserver_ver: '3.0.8',
  theme: ServotronixTheme
};

interface Theme {
  name: string;
  logo: string;
  spinner: string;
}