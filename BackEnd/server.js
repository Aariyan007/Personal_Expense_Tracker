const http = require('http');
const app = require('./index');
const PORT = process.env.PORT || 3000;

http.createServer(app).listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
})