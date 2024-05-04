const https = require('https'); // or 'https' for https:// URLs
const fs = require('fs');
const instagramDl = require("@sasmeee/igdl");

// Instagram URL'sini kontrol etmek için regex
const instagramUrlRegex = /^(?:https?:\/\/)?(?:www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?$/;

function isInstagramUrl(url) {
    return instagramUrlRegex.test(url)
}
function getFileName(disposition){
    const filenameRegex = /filename[^;\n=]*=((['"]).*?\2|[^;\n]*)/g;
    let match = filenameRegex.exec(disposition);
    let filename = match[1];
    if (filename.endsWith('.webp')) {
        filename = filename.replace(/\.webp$/, '.jpg');
    }
    return filename;
}
async function downloadInstagramContent(url) {

    const dataList = instagramDl(url).then(veri => {
        const request = https.get(veri[0].download_link, function(response) {
    
           const file = fs.createWriteStream(getFileName(response.headers['content-disposition']));
           response.pipe(file);
        
           // after download completed close filestream
           file.on("finish", () => {
               file.close();
           });
        });
    });
}
module.exports = { downloadInstagramContent, isInstagramUrl}
