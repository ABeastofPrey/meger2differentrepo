// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

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
  production: false,
  appName: 'ControlStudio+',
  api_url: 'http://10.4.20.85:1207',
  ip: '10.4.20.85',
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
