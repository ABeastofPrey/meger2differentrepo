@echo off

set PRODUCT=SOFTMC STUDIO
set WEBSERVER_MAPPING=/cs/
set RESOURCES_PATH=..\..\..\MCWebServer\src\main\resources
set PRODUCT_PATH=web\cs
set INDEX_NAME=CSWeb.html

if [%1]==[prod] (
	echo CREATING PRODUCTION VERSION FOR %PRODUCT%...
	echo Updating INDEX.HTML...
	powershell -Command "(Get-Content index.html) | ForEach-Object { $_ -replace '<!--<base href=\"%WEBSERVER_MAPPING%\">-->', '<base href=\"%WEBSERVER_MAPPING%\">' } | Set-Content index.html"
	echo Updating CONN.JS...
	powershell -Command "(Get-Content assets\scripts\conn.js) | ForEach-Object { $_ -replace '//var IP', 'var IP' } | Set-Content assets\scripts\conn.js"
	powershell -Command "(Get-Content assets\scripts\conn.js) | ForEach-Object { $_ -replace \"var IP = '\", \"//var IP = '\" } | Set-Content assets\scripts\conn.js"
	echo Updating API.SERVICE.TS...
	powershell -Command "(Get-Content app\services\api.service.ts) | ForEach-Object { $_ -replace \"const IP = '\", \"//const IP = '\" } | Set-Content app\services\api.service.ts"
	powershell -Command "(Get-Content app\services\api.service.ts) | ForEach-Object { $_ -replace \"//const IP = w\", \"const IP = w\" } | Set-Content app\services\api.service.ts"
	echo Building Angular app for Production...
	call ng build --prod
	echo Angular build is DONE!
	echo Deleting old %PRODUCT% files from webserver...
	del "%RESOURCES_PATH%\%INDEX_NAME%"
	del /S/Q "%RESOURCES_PATH%\%PRODUCT_PATH%\*"
	rmdir /S/Q "%RESOURCES_PATH%\%PRODUCT_PATH%\assets"
	echo Copying new %PRODUCT% files to the webserver...
	xcopy /s/e/k/y "..\dist" "%RESOURCES_PATH%\%PRODUCT_PATH%"
	echo Renaming index.html to %INDEX_NAME% and moving to Resources folder...
	ren "%RESOURCES_PATH%\%PRODUCT_PATH%\index.html" "%INDEX_NAME%"
	move "%RESOURCES_PATH%\%PRODUCT_PATH%\%INDEX_NAME%" "%RESOURCES_PATH%"
	echo DONE!
) else if [%1]==[debug] (
	echo CREATING DEBUG VERSION FOR %PRODUCT%...
	echo Updating INDEX.HTML...
	powershell -Command "(Get-Content index.html) | ForEach-Object { $_ -replace '<base href=\"%WEBSERVER_MAPPING%\">', '<!--<base href=\"%WEBSERVER_MAPPING%\">-->' } | Set-Content index.html"
	echo Updating CONN.JS...
	powershell -Command "(Get-Content assets\scripts\conn.js) | ForEach-Object { $_ -replace '//var IP', 'var IP' } | Set-Content assets\scripts\conn.js"
	powershell -Command "(Get-Content assets\scripts\conn.js) | ForEach-Object { $_ -replace 'var IP = s', '//var IP = s' } | Set-Content assets\scripts\conn.js"
	echo Updating API.SERVICE.TS...
	powershell -Command "(Get-Content app\services\api.service.ts) | ForEach-Object { $_ -replace '//const IP', 'const IP' } | Set-Content app\services\api.service.ts"
	powershell -Command "(Get-Content app\services\api.service.ts) | ForEach-Object { $_ -replace 'const IP = w', '//const IP = w' } | Set-Content app\services\api.service.ts"
	echo DONE!
) else (
	echo INVALID USE: use "build prod" or "build debug"
)