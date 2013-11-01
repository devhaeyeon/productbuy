// 모듈을 추출합니다.
var connect = require('connect');
var fs = require('fs');
var ejs = require('ejs');
 var port = process.env.PORT || 5000;

// 생성자 함수를 선언합니다.
var counter = 0;
function Product(name, image, price, count) {
    this.index = counter++;
    this.name = name;
    this.image = image;
    this.price = price;
    this.count = count;
}

// 변수를 선언합니다.
var products = [
    new Product('JavaScript', 'graphic.png', 28000, 1),
    new Product('jQuery', 'graphic.png', 28000, 0),
    new Product('Node.js', 'graphic.png', 32000, 10),
    new Product('Socket.io', 'graphic.png', 17000, 15),
    new Product('Connect', 'graphic.png', 18000, 15),
    new Product('Express', 'graphic.png', 31000, 26),
    new Product('EJS', 'graphic.png', 12000, 10)
];

// 웹 서버를 생성합니다.
var server = connect.createServer();
server.use(connect.static(__dirname + '/Resources'));
server.use(connect.router(function (app) {
    // HTMLPage.htm 파일을 읽습니다.
    var HTMLPage = fs.readFileSync('HTMLPage.htm', 'utf8');

    // GET - /
    app.get('/', function (request, response) {
        // 응답합니다.
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(ejs.render(HTMLPage, {
            products: products
        }));
    });
}));

// 웹 서버를 실행합니다.
server.listen(port, function () {
    console.log('Server Running at http://127.0.0.1:52273');
});

// 소켓 서버를 생성 및 실행합니다.
var io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket) {
    // 함수를 선언합니다.
    function onReturn(index) {
        // 물건 개수를 증가시킵니다.
        products[index].count++;

        // 타이머를 제거합니다.
        clearTimeout(cart[index].timerID);

        // 카트에서 물건을 제거합니다.
        delete cart[index];

        // count 이벤트를 발생시킵니다.
        io.sockets.emit('count', {
            index: index,
            count: products[index].count
        });
    };

    // 변수를 선언합니다.
    var cart = {};

    // cart 이벤트 
    socket.on('cart', function (index) {
        // 물건 개수를 감소시킵니다.
        products[index].count--;

        // 카트에 물건을 넣고 타이머를 시작합니다.
        cart[index] = {};
        cart[index].index = index;
        cart[index].timerID = setTimeout(function () {
            onReturn(index);
        }, 1000 * 60 * 10);

        // count 이벤트를 발생시킵니다.
        io.sockets.emit('count', {
            index: index,
            count: products[index].count
        });
    });

    // buy 이벤트
    socket.on('buy', function (index) {
        // 타이머를 제거합니다.
        clearTimeout(cart[index].timerID);

        // 카트에서 물건을 제거합니다.
        delete cart[index];

        // count 이벤트를 발생시킵니다.
        io.sockets.emit('count', {
            index: index,
            count: products[index].count
        });
    });

	io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
}); 


    // return 이벤트
    socket.on('return', function (index) {
        onReturn(index);
    });
});