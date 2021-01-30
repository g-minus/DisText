
export async function getUrl(url: string, isJson: boolean = true, mime: any = 'application/json') {
  const promise = new Promise<any>((resolve, reject) => {
    var xhr = new XMLHttpRequest();

    if (url.indexOf("$api$") > -1) {
      var repl = "";
      url = url.replace("$api$", repl);
    }

    xhr.open('GET', url);
    if (isJson) {
      xhr.setRequestHeader('Content-Type', mime);
    }
    xhr.onload = function () {
      if (xhr.status === 200) {
        if (isJson) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          resolve(xhr.responseText);
        }
      }
      else {
        reject(xhr);
      }
    };
    xhr.send();
  });

  return promise;
}

