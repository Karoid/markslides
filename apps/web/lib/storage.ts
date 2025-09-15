import { Client as MinioClient } from 'minio';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface StorageConfig {
    type: 'local' | 'minio';
    minioConfig?: {
        endPoint: string;
        port?: number;
        useSSL?: boolean;
        accessKey: string;
        secretKey: string;
        bucketName: string;
    };
    localConfig?: {
        uploadDir: string;
        baseUrl: string;
    };
}

export class StorageService {
    private config: StorageConfig;
    private minioClient?: MinioClient;

    constructor() {
        // 환경 변수를 기반으로 스토리지 설정 결정
        const minioEndpoint = process.env.MINIO_ENDPOINT;
        const minioAccessKey = process.env.MINIO_ACCESS_KEY;
        const minioSecretKey = process.env.MINIO_SECRET_KEY;
        const minioBucket = process.env.MINIO_BUCKET_NAME || 'markslides-images';

        if (minioEndpoint && minioAccessKey && minioSecretKey) {
            // MINIO 설정이 있는 경우
            this.config = {
                type: 'minio',
                minioConfig: {
                    endPoint: minioEndpoint,
                    port: parseInt(process.env.MINIO_PORT || '9000'),
                    useSSL: process.env.MINIO_USE_SSL === 'true',
                    accessKey: minioAccessKey,
                    secretKey: minioSecretKey,
                    bucketName: minioBucket,
                },
            };

            this.minioClient = new MinioClient({
                endPoint: this.config.minioConfig.endPoint,
                port: this.config.minioConfig.port,
                useSSL: this.config.minioConfig.useSSL,
                accessKey: this.config.minioConfig.accessKey,
                secretKey: this.config.minioConfig.secretKey,
            });
        } else {
            // 로컬 스토리지 설정
            this.config = {
                type: 'local',
                localConfig: {
                    uploadDir: path.join(process.cwd(), 'public', 'uploads'),
                    baseUrl: '/uploads',
                },
            };

            // 업로드 디렉토리가 없으면 생성
            if (!fs.existsSync(this.config.localConfig.uploadDir)) {
                fs.mkdirSync(this.config.localConfig.uploadDir, { recursive: true });
            }
        }
    }

    async uploadFile(
        buffer: Buffer,
        originalName: string,
        mimeType: string
    ): Promise<{ url: string; filename: string; storageType: string }> {
        const fileExtension = path.extname(originalName);
        const filename = `${uuidv4()}${fileExtension}`;

        if (this.config.type === 'minio' && this.minioClient && this.config.minioConfig) {
            // MINIO 업로드
            const bucketName = this.config.minioConfig.bucketName;
            
            // 버킷이 없으면 생성
            const bucketExists = await this.minioClient.bucketExists(bucketName);
            if (!bucketExists) {
                await this.minioClient.makeBucket(bucketName);
            }

            await this.minioClient.putObject(bucketName, filename, buffer, buffer.length, {
                'Content-Type': mimeType,
            });

            const protocol = this.config.minioConfig.useSSL ? 'https' : 'http';
            const port = this.config.minioConfig.port === 80 || this.config.minioConfig.port === 443 
                ? '' 
                : `:${this.config.minioConfig.port}`;
            
            const url = `${protocol}://${this.config.minioConfig.endPoint}${port}/${bucketName}/${filename}`;

            return {
                url,
                filename,
                storageType: 'minio',
            };
        } else {
            // 로컬 스토리지 업로드
            const filePath = path.join(this.config.localConfig!.uploadDir, filename);
            fs.writeFileSync(filePath, buffer);

            const url = `${this.config.localConfig!.baseUrl}/${filename}`;

            return {
                url,
                filename,
                storageType: 'local',
            };
        }
    }

    async deleteFile(filename: string, storageType: string): Promise<void> {
        if (storageType === 'minio' && this.minioClient && this.config.minioConfig) {
            await this.minioClient.removeObject(this.config.minioConfig.bucketName, filename);
        } else if (storageType === 'local' && this.config.localConfig) {
            const filePath = path.join(this.config.localConfig.uploadDir, filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
    }

    getStorageType(): 'local' | 'minio' {
        return this.config.type;
    }
}

export const storageService = new StorageService();
