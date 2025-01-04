import multer from 'multer'
export const fileValidation = {
    image: ['image/jpeg', 'image/png', 'image/gif'],
    file: ['application/pdf', 'application/msword'],
    video: ['video/mp4'],
    audio: ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/ogg'] 

}
export function ImageUpload(customValidation = []) {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/'); 
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + '-' + file.originalname);
        }
    });

    function fileFilter(req, file, cb) {
        if (customValidation.includes(file.mimetype)) {
            cb(null, true);
        } else {
            console.error(`File format not allowed: ${file.mimetype}`);
            cb(new Error('Invalid file format'), false);
        }
    }

    const upload = multer({ storage, fileFilter });
    return upload;
}


export function fileUpload(customValidation = [], fileSizeLimit = 5 * 1024 * 1024) { 
    function fileFilter(req, file, cb) {
        if (customValidation.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file format'), false); 
        }
    }
    
    const storage = multer.memoryStorage();
    const upload = multer({
        fileFilter,
        storage,
        limits: { fileSize: fileSizeLimit }, 
    });
    
    return upload;
}