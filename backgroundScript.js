chrome.tabs.onUpdated.addListener(
  function(tabId, changeInfo, tab) {
      console.log('running background script')
      if (changeInfo.url) {

        let url = changeInfo.url.split('/');

        if(url[2]=='github.com' && url[3] && url[4]){

          console.log('Sending message')

          chrome.tabs.sendMessage( tabId, {
            message: 'urlUpdated',
            urls:changeInfo.url,
            repo_owner:url[3],
            repo_name:url[4],
          })
        }
        console.log('updated url is',changeInfo.url,url[3],url[4],url[2])
      }
    }
  );