request.open("GET", "www.example.com", true);
request.overrideMimeType("text/html; charset=windows-1251");
request.send(null);
