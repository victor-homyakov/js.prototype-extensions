@echo off
set BROWSER=%1
if "%BROWSER%"=="" set BROWSER=start
for %%F in (*test.html) do %BROWSER% %%F
