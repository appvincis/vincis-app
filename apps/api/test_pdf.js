import fs from 'fs';
import pdf from 'pdf-parse';

function render_page(pageData) {
    let render_options = {
        normalizeWhitespace: false,
        disableCombineTextItems: false
    }
    return pageData.getTextContent(render_options)
    .then(function(textContent) {
        let lastY, text = '';
        for (let item of textContent.items) {
            if (lastY == item.transform[5] || !lastY){
                text += item.str;
            }  
            else{
                text += '\n' + item.str;
            }    
            lastY = item.transform[5];
        }
        return `--- PAGE ${pageData.pageNumber} ---\n${text}`;
    });
}

const dataBuffer = fs.readFileSync('/home/igorpeixoto/Vincis-App/apps/api/package.json'); // Just reading any file to see if it throws standard error

let options = {
    pagerender: render_page
}

pdf(dataBuffer, options).then(function(data) {
    console.log(data.text);
}).catch(e => console.log('Error as expected with package.json', e.message));
