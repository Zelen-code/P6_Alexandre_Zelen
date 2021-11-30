const multer = require('multer');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

// indicates to Multer where to save incoming files 
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images');
    },

    // "filename" indicates to Multer to use the original name, to replace the spaces by underscores et add a timestamp "Date.now()" as file name
    // it uses then MIME const to resolve the appropriate file extension  
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + Date.now() + '.' + extension);
    }
});

// We indicate to Multer that we will just manage image files downloads 
module.exports = multer({ storage }).single('image');