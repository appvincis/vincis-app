import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../auth/auth.middleware.js';
import {
    uploadEdital,
    getEditais,
    getEditalSignedUrl,
    deleteEdital
} from './edital.controller.js';

export const editalRouter = Router();

// Configuração do Multer (armazenamento em memória) com limite de 5MB
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos PDF são permitidos'));
        }
    }
});

// Todas as rotas de edital exigem autenticação
editalRouter.use(requireAuth);

editalRouter.post('/', upload.single('file'), uploadEdital);
editalRouter.get('/', getEditais);
editalRouter.get('/:id/url', getEditalSignedUrl);
editalRouter.delete('/:id', deleteEdital);
