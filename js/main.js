const url = '../docs/a1aa.pdf';

let pdfDoc = null,
  pageNum = 1,
  pageIsRendering = false,
  pageNumIsPending = null;

const scale = 1.5,
  canvas = document.querySelector('#pdf-render'),
  ctx = canvas.getContext('2d');

//RTender Page

const renderpage = num => {
  pageIsRendering = true;

  //Get Page
  pdfDoc.getPage(num).then(page => {
    //console.log(page);
    //set scale
    const viewport = page.getViewport({ scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderCtx = {
      canvasContext: ctx,
      viewport
    };
    page.render(renderCtx).promise.then(() => {
      pageIsRendering = false;

      if (pageNumIsPending !== null) {
        renderpage(pageNumIsPending);
        pageNumIsPending = null;
      }
    });

    //Output Current Page
    document.querySelector('#page-num').textContent = num;
  });
};

//Check for Page rendering
const queueRenderPage = num => {
  if (pageIsRendering) {
    pageNumIsPending = num;
  } else {
    renderpage(num);
  }
};
//show prev page
const showPrevPage = () => {
  if (pageNum <= 1) {
    return;
  }
  pageNum--;
  queueRenderPage(pageNum);
};

//show next page
const showNextPage = () => {
  if (pageNum >= pdfDoc.numPages) {
    return;
  }
  pageNum++;
  queueRenderPage(pageNum);
};
//Get Document

pdfjsLib
  .getDocument(url)
  .promise.then(pdfDoc_ => {
    pdfDoc = pdfDoc_;
    //console.log(pdfDoc);

    document.querySelector('#page-count').textContent = pdfDoc.numPages;

    renderpage(pageNum);
  })
  .catch(err => {
    //DIsplay Error
    const div = document.createElement('div');
    div.className = 'error';
    div.appendChild(document.createTextNode(err.message));
    document.querySelector('body').insertBefore(div, canvas);

    //remove TopBar
    document.querySelector('.top-bar').style.display = 'none';
  });

//Button Events
document.querySelector('#prev-page').addEventListener('click', showPrevPage);
document.querySelector('#next-page').addEventListener('click', showNextPage);
