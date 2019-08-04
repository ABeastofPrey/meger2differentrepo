// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

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
  production: false,
  appName: 'ControlStudio+',
  appName_Kuka: 'KUKA.ControlStudio',
  api_url: 'http://10.4.20.51:1207',
  ip: '10.4.20.51',
  gui_ver: 'v1.1.4-dev 2019-08-04',
  compatible_webserver_ver: 'v3.1.5',
  platform: Platforms.Kuka,
  platforms: Platforms,
};
