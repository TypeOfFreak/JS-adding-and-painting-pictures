var canvas;
var context;
var previousColorElement, previousSelectedRect, previousSelectedText;
var mouse_event; // Values: None, drawing, dragging, pipping, addingCircle, addingRect, addingLine, addingText
var AltDown;
// Создаем объект изображения
var img = new Image();
var circles = [], rectangles = [], texts = [];
var figures = [];
var new_line, new_circle, new_rect, new_straight_line, new_text;
var fill_figure;

class Figure {
    constructor() {}
    Draw() {}
}

class TextFig extends Figure {
    constructor(text, x, y) {
        super();
        this.text = text;
        this.x = x;
        this.y = y;
        this.color = document.getElementById('color').value;
    }
    Draw() {
        context.font = "25px Verdana, sans-serif";
        
        context.fillStyle = this.color;
        context.fillText(this.text, this.x, this.y);
    }
}

class Rectangle extends Figure {
    constructor(x,y, w,h) {
        super();
        this.x = x;
        this.y = y;
        this.w = -w;
        this.h = -h;
        this.color = document.getElementById('color').value;
        this.isSelected = false;
        this.fill = fill_figure;
    }

    inside(x, y){
        if(x < Math.min(this.x, this.x + this.w)){
            return false;
        }
        if (x > Math.max(this.x, this.x + this.w)){
            return false;
        }
        if(y < Math.min(this.y, this.y + this.h)) {
            return false;
        }
        if (y > Math.max(this.y, this.y + this.h)){
            return false;
        }
        return true;
    }
    Draw() {
        context.strokeStyle = this.color;
        context.strokeRect(this.x,  this.y, this.w, this.h);
        if (this.fill) {
            context.fillStyle = this.color;
            context.fillRect(this.x,  this.y, this.w, this.h);
        }

        if (this.isSelected) {
            context.lineWidth = 5;
        }
        else {
            context.lineWidth = 3;
        }
    }
}
class Straight_line extends Figure{
    constructor(x0,y0, x1,y1){
        super();
        this.x0 = x0;
        this.x1 = x1;
        this.y0 = y0;
        this.y1 = y1;
        this.color = document.getElementById('color').value;
    }
    Draw() {
        context.beginPath();
        context.moveTo(this.x0, this.y0 );
        context.lineTo(this.x1, this.y1);
        context.stroke();
    }
}
class Circle extends Figure{
    constructor(x, y, radius) {
        super();
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = document.getElementById('color').value;
        this.isSelected = false;
        this.fill = fill_figure;
    }
    Draw() {

        // Рисуем текущий круг
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        if (this.fill ) {
            context.fillStyle = this.color;
        }
        context.strokeStyle = this.color;

        // Выделяем выбранный круг рамкой
        if (this.isSelected) {
            context.lineWidth = 5;
        }
        else {
            context.lineWidth = 3;
        }
        if (this.fill ) {
            context.fill();
        }
        context.stroke(); 
    }

}

class Line extends Figure{
    constructor(v) {
        super();
        this.v = v;
        this.color = document.getElementById('color').value;
        this.thickness = document.getElementById('Thickness').value;
    }
    Draw() {
        context.beginPath();
        context.strokeStyle = this.color;
        context.lineWidth = this.thickness;

        // Помещаем "кисть" на холст
        context.moveTo(this.v[0][0], this.v[0][1]);
        for (let i = 1; i<this.v.length; i++) {
            let line_x = this.v[i][0];
            let line_y = this.v[i][1];
            context.lineTo(line_x, line_y);
            context.stroke();
        }
    }
}
window.onload = function() {
    AltDown = false, fill_figure=false;
    mouse_event = "None";  
    canvas = document.getElementById("drawingCanvas");
    context = canvas.getContext("2d");
    context.lineWidth = 5;
    // Подключаем требуемые для рисования события
    canvas.onmousedown = startDrawing;
    canvas.onmouseup = stopDrawing;
    canvas.onmouseout = stopDrawing;
    canvas.onmousemove = draw;

    img.onload = function() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        var old_lineWidth = context.lineWidth;
        var old_color = context.strokeStyle;
        DrawImage(this);
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
var previousSelectedCircle;


function addCircle(e) {
    if (mouse_event == 'addingCircle') {
        e.className = "circle-button"
        mouse_event = 'None';
    } else if (mouse_event == 'None') {
        e.className = "circle-button activated";
        mouse_event = 'addingCircle';
    }
    
}
function DrawImage(img) {
    let loadedImageWidth = img.width;
    let loadedImageHeight = img.height;

    // get the scale
    // it is the min of the 2 ratios
    let scale_factor = Math.min(canvas.width / img.width, canvas.height / img.height);
    
    // Lets get the new width and height based on the scale factor
    let newWidth = img.width * scale_factor;
    let newHeight = img.height * scale_factor;
        
    // get the top left position of the image
    // in order to center the image within the canvas
    let x = (canvas.width / 2) - (newWidth / 2);
    let y = (canvas.height / 2) - (newHeight / 2);
    
    // When drawing the image, we have to scale down the image
    // width and height in order to fit within the canvas
    context.drawImage(img, x, y, newWidth, newHeight);
}

function addImage() {
    clearCanvas();
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
function DrawFigures () {
    // Очистить холст
    context.clearRect(0, 0, canvas.width, canvas.height);
    DrawImage(img);
    for (let i = 0; i<figures.length; i++) {
        figures[i].Draw();
    }
    context.lineWidth = document.getElementById('Thickness').value;
    context.strokeStyle = document.getElementById('color').value;
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
document.onpaste = function (pasteEvent) {
    clearCanvas();
    // получаем первый элемент содержимого буфера обмена
    const item = pasteEvent.clipboardData.items[0];
    
    // смотрим, является ли элемент изображением
    if (item.type.indexOf("image") === 0) {

        // преобразуем содержимое первого элемента буфера обмена в файл
        const blob = item.getAsFile();

        // создаем объект, считывающий файлы
        const reader = new FileReader();

        // когда файл загрузится
        reader.onload = function (event) {
            // вставляем его на страницу
            img.src = event.target.result;
        };

        // запускаем чтение двоичных данных файл как тип data URL
        reader.readAsDataURL(blob);
    }
}
document.addEventListener("keydown", function (e) {
    if (e.ctrlKey) {
        if (e.key == 'z') {
            if (figures.length > 0) {
                let fig = figures.pop();
                if (fig instanceof Circle) {
                    circles.pop();
                }
                if (fig instanceof Rectangle) {
                    rectangles.pop();
                }
                if (fig instanceof TextFig) {
                    texts.pop();
                }
                DrawFigures();
        
            }
        } else if (e.key == 'c'){

        } else if (e.key == 'v') {

        }
    }
    else if (e.altKey) {
        AltDown = true;
    }
});

document.addEventListener("keyup", function (e) {
    if (e.key == 'Alt') {
        AltDown = false;
    }
});

function startDrawing(e) {
    let x = e.pageX - canvas.offsetLeft;
    let y = e.pageY - canvas.offsetTop;
    switch(mouse_event) {
        case 'None': 
            if (AltDown) {
                // Проверяем, щелкнули ли no кругу
                for(let i=circles.length-1; i>=0; i--) {
                    let circle = circles[i];
    
                    // С помощью теоремы Пифагора вычисляем расстояние от 
                    // точки, в которой щелкнули, до центра текущего круга
                    let distanceFromCenter = Math.sqrt(Math.pow(circle.x - x, 2) + Math.pow(circle.y - y, 2));
    
                    // Определяем, находится ли точка, в которой щелкнули, в данном круге
                    if (distanceFromCenter <= circle.radius) {
                        // Сбрасываем предыдущий выбранный круг	
                        if (previousSelectedCircle != null) previousSelectedCircle.isSelected = false;
                        previousSelectedCircle = circle;
    
                        // Устанавливаем новый выбранный круг и обновляем холст
                        circle.isSelected = true;
                        circle.Draw();
                        mouse_event = 'dragging';
                        // Прекращаем проверку
                        return;
                    }
                }
                for (let i = rectangles.length -1; i>=0; i--) {
                    let rect = rectangles[i];
                    if (rect.inside(x, y)) {
                        if (previousSelectedRect != null) previousSelectedRect.isSelected = false;
                        previousSelectedRect = rect;
                        rect.isSelected = true;
                        rect.Draw();
                        mouse_event = 'dragging';
                        return;
                    }
                }
                for (let i = texts.length - 1; i>=0; i--) {
                    let text = texts[i];
                    if (Math.sqrt(Math.pow(text.x - x, 2) + Math.pow(text.y - y, 2)) <= 150) {

                        if (previousSelectedText!= null) previousSelectedText.isSelected = false;
                        previousSelectedText = text;
                        mouse_event = 'dragging';
                        return;
                    }
                }
            } else {
                // Начинаем рисовать
                mouse_event = 'drawing';
                v = [[e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop]]
                new_line = new Line(v);
                
                // Создаем новый путь (с текущим цветом и толщиной линии) 
                context.beginPath();
                
                // Нажатием левой кнопки мыши помещаем "кисть" на холст
                context.moveTo(e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop);
            }
        break
        case 'addingText':        
            let text_to_add = prompt ('Введите текст:');
            new_text = new TextFig(text_to_add, x, y);
            figures.push(new_text);
            texts.push(new_text);
            new_text.Draw();
            mouse_event = 'None';
            document.getElementById('TEXT').className = "text-button";
        break
        case 'addingCircle':
            radius = 50;
            // Создаем новый круг
            new_circle = new Circle(x, y, radius);
        
            // Сохраняем его в массиве
            figures.push(new_circle);
            circles.push(new_circle);
        
            // Обновляем отображение круга
            circle.Draw();
        break
        case 'addingRect':
            new_rect = new Rectangle(x, y, 50, 50);
            figures.push(new_rect);
            rectangles.push(new_rect);
            new_rect.Draw();
        break
        case 'addingLine':
            new_straight_line = new Straight_line(x,y, x+10, y+10);
            figures.push(new_straight_line);
            new_straight_line.Draw();
        break
        case 'pipping':
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
        break
    }
}
function draw(e) {
    let x = e.pageX - canvas.offsetLeft;
    let y = e.pageY - canvas.offsetTop;
    switch (mouse_event){
        case 'dragging':
            // Проверка попадания
            if (previousSelectedCircle != null) {
        
              // Перемещаем круг в новую позицию
              previousSelectedCircle.x = x;
              previousSelectedCircle.y = y;
        
              // Обновляем холст
              DrawFigures();
            } 
            if (previousSelectedRect != null) {
              previousSelectedRect.x = x - previousSelectedRect.w/2;
              previousSelectedRect.y = y - previousSelectedRect.h/2;
        
              // Обновляем холст
              DrawFigures();
            }
            if (previousSelectedText != null) {
                previousSelectedText.x = x;
                previousSelectedText.y = y;
          
                // Обновляем холст
                DrawFigures();
              }
        break
        case 'drawing': 
            // Рисуем линию до новой координаты
            context.lineTo(x, y);
            context.stroke();
            new_line.v.push([x,y]);
        break
        case 'addingCircle':
            let radius = Math.sqrt(Math.pow(new_circle.x - x, 2) + Math.pow(new_circle.y - y, 2))
            new_circle.radius = radius;
            DrawFigures();
        break
        case 'addingRect':
            new_rect.w = x - new_rect.x;
            new_rect.h = y - new_rect.y;
            DrawFigures(); 
        break
        case 'addingLine':
            new_straight_line.x1 = x;
            new_straight_line.y1 = y;
            DrawFigures();
        break
    }
}
function stopDrawing() {      
    switch (mouse_event){ 
        case "drawing":
            figures.push(new_line);
        break
        case 'addingCircle':
            new_circle = null;
            document.getElementById("circle").className = "circle-button";
        break
        case 'addingRect':
            new_rect = null;
            document.getElementById("rect").className = "rect-button";
        break
        case 'addingLine':
            new_straight_line = null;
            document.getElementById("line").className = "line-button";
        break
        case 'dragging':
            if (previousSelectedCircle != null){
                previousSelectedCircle = null;
                previousSelectedCircle.isSelected = false;
            }
            if (previousSelectedRect != null){
                previousSelectedRect = null;
                previousSelectedRect.isSelected = false;
            }
            if (previousSelectedText != null){
                previousSelectedText = null;
                previousSelectedText.isSelected = false;
            }
            DrawFigures();
        break
    }
    DrawFigures();
    mouse_event = "None";
}
function clearCanvas() {
    circles = [];
    figures = [];
    context.clearRect(0, 0, canvas.width, canvas.height);
	DrawImage(img);
}
function getImage(canvas){
    let imageData = canvas.toDataURL();
    let image = new Image();
    image.src = imageData;
    return image;
}
 
function saveImage(image) {
    let link = document.createElement("a");
 
    link.setAttribute("href", image.src);
    link.setAttribute("download", "canvasImage");
    link.click();
}
 
function pipe(e) {
    if (mouse_event == 'pipping') {
        e.className = "pipe-button";
        mouse_event = 'None';
    } else  if (mouse_event == 'None') {
        e.className = "pipe-button activated";
        mouse_event = 'pipping';
    }
}
 
function saveCanvas(){
    let image = getImage(document.getElementById("drawingCanvas"));
    saveImage(image);
}
function fill(e) {
    fill_figure = !fill_figure
    if (fill_figure) {
        e.textContent = "FILL";
    } else {
        e.textContent = "NOT FILL";
    }
}
function addRect(e) {    
    if (mouse_event == 'addingRect') {
        e.className = "rect-button"
        mouse_event = 'None';
    } else if (mouse_event == 'None') {
        e.className = "rect-button activated";
        mouse_event = 'addingRect';
    }

}

function addStrLine(e) {
    if (mouse_event == 'addingLine') {
        e.className = "line-button"
        mouse_event = 'None';
    } else if (mouse_event == 'None') {
        e.className = "line-button activated";
        mouse_event = 'addingLine';
    }
}

function addText(e) {    
    if (mouse_event == 'addingText') {
        e.className = "text-button"
        mouse_event = 'None';
    } else if (mouse_event == 'None') {
        e.className = "text-button activated";
        mouse_event = 'addingText';
    }
}