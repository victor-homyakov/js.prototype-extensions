@echo off
set BROWSER=%1
if "%BROWSER%"=="" set BROWSER=start
for %%F in (*test.html) do %BROWSER% http://localhost:63342%~p0%%F
