var canvas;
var context;
var previousColorElement;
var isDrawing;
var piping = false;
// Создаем объект изображения
var img = new Image();


window.onload = function() {
      canvas = document.getElementById("drawingCanvas");
      context = canvas.getContext("2d");
      context.lineWidth = 5;
       
      // Подключаем требуемые для рисования события
      canvas.onmousedown = startDrawing;
      canvas.onmouseup = stopDrawing;
      canvas.onmouseout = stopDrawing;
      canvas.onmousemove = draw;

      img.onload = function() {
        var old_lineWidth = context.lineWidth;
        var old_color = context.strokeStyle;
        //canvas.width = this.width;
        canvas.height = 800*this.height/this.width;
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        context.lineWidth = old_lineWidth;
        context.strokeStyle = old_color;
    };
   }
/*window.onresize = function() {
    oldimg = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
    canvas.width = window.innerWidth*0.8;
    
    console.log(document.width);
    context.putImageData(oldimg, 0, 0, 0, 0, context.canvas.width, context.canvas.height);  
}*/

function addImage() {

    document.getElementById('Image').addEventListener('change', function() {
        if (this.files && this.files[0]) {
            var reader = new FileReader();
              reader.onload = function (e) {
                img.src =  e.target.result;
            };
            reader.readAsDataURL(this.files[0]);
          }
        
        });
}

function changeColor(Element)
{
    // 	Меняем текущий цвет рисования
    context.strokeStyle = Element.value;
}
var previousThicknessElement;

function changeThickness (Element)
{
    // Изменяем текущую толщину линии
	context.lineWidth = Element.value;
}
function startDrawing(e) {
	if (!piping) {
        // Начинаем рисовать
        isDrawing = true;
        
        // Создаем новый путь (с текущим цветом и толщиной линии) 
        context.beginPath();
        
        // Нажатием левой кнопки мыши помещаем "кисть" на холст
        context.moveTo(e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop);

    } else {
        let x = e.pageX - canvas.offsetLeft;
		let y = e.pageY - canvas.offsetTop;
        let imageData = context.getImageData(x, y, 1, 1);
        let pixel = imageData.data;
        
        var dColor = pixel ?
        (pixel[0] | 1 << 8).toString(16).slice(1) +
        (pixel[1] | 1 << 8).toString(16).slice(1) +
        (pixel[2] | 1 << 8).toString(16).slice(1) : pixel;
        
        document.getElementById('color').value = '#' + dColor.toString(16);
        document.getElementById("pipppet").className = "pipe-button";
        piping = false;
        context.strokeStyle = '#' + dColor.toString(16);



    }
}
function draw(e) {
	if (isDrawing == true)
	{
	  	// Определяем текущие координаты указателя мыши
		let x = e.pageX - canvas.offsetLeft;
		let y = e.pageY - canvas.offsetTop;
		
		// Рисуем линию до новой координаты
		context.lineTo(x, y);
		context.stroke();
	}
}
function stopDrawing() {
    isDrawing = false;	
}
function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
	context.drawImage(img, 0, 0, canvas.width, canvas.height);
}
function getImage(canvas){
    var imageData = canvas.toDataURL();
    var image = new Image();
    image.src = imageData;
    return image;
}
 
function saveImage(image) {
    var link = document.createElement("a");
 
    link.setAttribute("href", image.src);
    link.setAttribute("download", "canvasImage");
    link.click();
}
 
function pipe(e) {
    if (piping) {
        e.className = "pipe-button";
        piping = false;
    } else {
        e.className = "pipe-button-activated";
        piping = true;
    }
}
 
function saveCanvas(){
    var image = getImage(document.getElementById("drawingCanvas"));
    saveImage(image);
}