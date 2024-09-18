const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const productController = require('./controllers/productController');
const userController = require('./controllers/userController');
const dotenv = require('dotenv');

// Load environment variables (if necessary)
dotenv.config();

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');  // Ensure the 'uploads' directory exists
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix);
    }
});

const upload = multer({ storage: storage });
const bodyParser = require('body-parser');
const app = express();

// Set up CORS to allow requests from the deployed frontend
app.use(cors({
app.use(cors({
    origin: "https://manipalmarket.vercel.app",  // Allow requests from your deployed frontend
    methods: ["GET", "POST", "PUT", "DELETE"],  // Allowed HTTP methods
    credentials: true,  // Allow sending cookies or credentials if needed
}));
app.options('*', cors()); 
// Serve static files from 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// MongoDB connection
const port = process.env.PORT || 4000;  // Use environment port or default to 4000
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1); // Exit the server if the DB connection fails
    });

// Routes
app.get('/', (req, res) => {
    res.send('hello...');
});

console.log(productController);  // Log productController object

// Search route
app.get('/search', productController.search);

// Add product route (multer for handling image uploads)
console.log(upload.fields([{ name: 'pimage' }, { name: 'pimage2' }]));  // Log multer middleware

app.post('/add-product', upload.fields([{ name: 'pimage' }, { name: 'pimage2' }]), productController.addProduct);

// Get products route
app.get('/get-products', productController.getProducts);

// Get product by ID route
app.get('/get-product/:pId', productController.getProductsById);

// User-related routes
app.post('/liked-products', userController.likedProducts);
app.post('/my-products', productController.myProducts);
app.post('/signup', userController.signup);
app.get('/my-profile/:userId', userController.myProfileById);
app.get('/get-user/:uId', userController.getUserById);
app.post('/login', userController.login);

// Start server
app.listen(port, () => {
    console.log(`Backend server listening on port ${port}`);
});
