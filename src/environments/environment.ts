// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

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
  production: false,
  appName: 'ControlStudio+',
  appName_Kuka: 'KUKA.ControlStudio',
  api_url: 'http://10.4.20.28:1207',
  ip: '10.4.20.28',
  gui_ver: 'v1.5.2.1-dev 2020-07-19',
  compatible_webserver_ver: 'v3.5.2',
  platform: PLATFORMS.Servotronix,
  platforms: PLATFORMS,
  useDarkTheme: false
};
