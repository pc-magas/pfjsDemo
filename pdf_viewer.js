function loadPdf(element)
{
    var spinner = `
        <div class="spinner-container">
            <div class="lds-ring">
                <div></div><div></div><div></div><div></div>
            </div>
            <span style="text-align:center;font-size:2rem;">Loading PDF...</span>
        </div>`;
    $(element).append(spinner);

    var container = document.createElement('div');
    container.className='pdf-container';
    var data = $(element).data('pdf');
    
    // Loaded via <script> tag, create shortcut to access PDF.js exports.
    var pdfjsLib = window['pdfjs-dist/build/pdf'];
    // The workerSrc property shall be specified.
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js';

    // Asynchronous download of PDF

    var loadingTask = pdfjsLib.getDocument(data);
    loadingTask.promise.then(function(pdf) {
        console.log('PDF loaded');
        renderPage(pdf,container, function(){
            $(element).html("");
            $(element).append(container);
        });
        
    }, function (reason) {
            // PDF loading error
            console.error(reason);            
    });
}

function renderPage(pdf,container,renderCompleteCallback,pageNumber)
{

    if(!pageNumber){
        pageNumber = 1;
    }

    var totalPages = pdf.numPages;           
    console.log(totalPages, pageNumber);
    if(pageNumber > totalPages){
        renderCompleteCallback();
        return;
    }

    pdf.getPage(pageNumber).then(function(page) {
        console.log('Page loaded');
                    
        var scale = 1.5;
        var viewport = page.getViewport({scale: scale});

        // Prepare canvas using PDF page dimensions
        var canvas    = document.createElement('canvas');
        var context   = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width  = viewport.width;

        // Render PDF page into canvas context
        var renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        var renderTask = page.render(renderContext);
        renderTask.promise.then(function () {
            console.log('Page rendered');
            $(container).append(canvas);
            pageNumber++;
            renderPage(pdf,container,renderCompleteCallback,pageNumber);
        });
    });
}

(function ( $ ) {
    $.fn.pdf = function() {
        loadPdf(this);
        return this;
    };
}( jQuery ));